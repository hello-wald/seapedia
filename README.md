# seapedia

A multi-seller marketplace. Monorepo with a NestJS API (`apps/api`), a React Router web app
(`apps/web`), and shared Zod schemas (`packages/shared`).

## Cart & single-store checkout

Buyers stage products in a cart before checkout. Because SEApedia is multi-seller, the cart
enforces a **single-store rule**: a cart can only contain products from one store at a time.

### Behavior

- **Add to cart** from the product page using a quantity stepper (capped at available stock); the
  purchase box shows the live subtotal before adding.
- **Update quantity** and **remove items** from the cart page (`/buyer/cart`). The cart page also
  shows the order subtotal and total item count.
- **Single-store rule** — when a buyer tries to add a product from a _different_ store than the one
  already in their cart, the API rejects it with **HTTP 409 Conflict** (it does not silently mix
  stores). The web app catches the conflict and opens a **"Start a new cart?"** dialog naming the
  current store; confirming **replaces** the cart (clears it and adds the new item), cancelling
  keeps the existing cart. The cart page also displays the store the cart belongs to with a note
  that a cart holds products from one store.

### API endpoints (`BUYER` role)

| Method   | Path                      | Description                                                                |
| -------- | ------------------------- | -------------------------------------------------------------------------- |
| `GET`    | `/api/cart`               | Cart summary (store, items, subtotal, total items)                         |
| `POST`   | `/api/cart/items`         | Add a product (`{ productId, quantity, replace? }`); 409 on store conflict |
| `PUT`    | `/api/cart/items/:itemId` | Update a cart item's quantity                                              |
| `DELETE` | `/api/cart/items/:itemId` | Remove an item                                                             |
| `DELETE` | `/api/cart`               | Empty the cart                                                             |

On a store conflict, `POST /api/cart/items` returns
`{ message, conflict: true, currentStoreName }`. Sending the same request with `replace: true`
clears the cart and adds the item.

## Checkout & orders

Checkout turns a buyer's (single-store) cart into an **Order**, charges the buyer's wallet,
reduces product stock, and starts the order's status history.

### Pricing & tax

The checkout summary (shown in the UI before confirmation) and the server use the **same**
calculation (`computeOrderTotals` in `packages/shared`), so what the buyer sees is what they pay:

```
subtotal      = Σ (unit price × quantity)          // from the cart
delivery fee  = per delivery method (see below)
PPN (12%)     = round(subtotal × 0.12)
total         = subtotal + delivery fee + PPN
```

- **PPN is 12%.** **Tax base = the product subtotal only** — the delivery fee is **not** taxed.
  This is the documented choice for the "tax base differs" note: PPN applies to goods, not shipping.
- **Delivery methods & fees** (each differs, per the business rule):

    | Method   | Fee       |
    | -------- | --------- |
    | Instant  | Rp 30.000 |
    | Next Day | Rp 15.000 |
    | Regular  | Rp 10.000 |

### Behavior & rules

- **Single-store** — checkout uses the cart, which already enforces one store per cart.
- **Wallet payment** — the buyer is charged `total` from their wallet balance; checkout is
  **rejected if the balance is insufficient** (HTTP 403). The debit is recorded as a `PURCHASE`
  row in the wallet transaction ledger, linked to the order via `orderId`.
- **Safe stock reduction** — stock is decremented with a `stock >= quantity` guard inside the
  checkout transaction, so it can **never go negative** (and is race-safe). If any item lacks
  stock, the whole checkout rolls back.
- **Initial status** is **`Sedang Dikemas`**, recorded in `OrderStatusHistory` with a timestamp.
- Everything (stock, wallet debit, order + items + status, cart clear) runs in **one DB
  transaction** — all-or-nothing.

### Data model

`Order` (header: buyer, store, delivery method, subtotal/fee/tax/total, current status, address
snapshot) → `OrderItem` (product **name + unit price snapshotted** at purchase) and
`OrderStatusHistory` (status + timestamp). The `WalletTransaction` money ledger links back to an
order via a nullable `orderId`. Orders are the commercial record; the ledger is the money trail.

### API endpoints

| Method | Path                   | Role     | Description                                          |
| ------ | ---------------------- | -------- | ---------------------------------------------------- |
| `POST` | `/api/orders/checkout` | `BUYER`  | Check out the cart (`{ addressId, deliveryMethod }`) |
| `GET`  | `/api/orders`          | `BUYER`  | Buyer order history                                  |
| `GET`  | `/api/orders/:id`      | `BUYER`  | Buyer order detail                                   |
| `GET`  | `/api/orders/incoming` | `SELLER` | Incoming orders for the seller's store               |

## Development

```bash
pnpm db:up        # start Postgres (docker compose)
pnpm db:migrate   # apply Prisma migrations
pnpm dev          # run api + web in parallel
```

API docs (Swagger) are served at `http://localhost:3000/api/docs`.
