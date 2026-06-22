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
- **Single-store rule** — when a buyer tries to add a product from a *different* store than the one
  already in their cart, the API rejects it with **HTTP 409 Conflict** (it does not silently mix
  stores). The web app catches the conflict and opens a **"Start a new cart?"** dialog naming the
  current store; confirming **replaces** the cart (clears it and adds the new item), cancelling
  keeps the existing cart. The cart page also displays the store the cart belongs to with a note
  that a cart holds products from one store.

### API endpoints (`BUYER` role)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/cart` | Cart summary (store, items, subtotal, total items) |
| `POST` | `/api/cart/items` | Add a product (`{ productId, quantity, replace? }`); 409 on store conflict |
| `PUT` | `/api/cart/items/:itemId` | Update a cart item's quantity |
| `DELETE` | `/api/cart/items/:itemId` | Remove an item |
| `DELETE` | `/api/cart` | Empty the cart |

On a store conflict, `POST /api/cart/items` returns
`{ message, conflict: true, currentStoreName }`. Sending the same request with `replace: true`
clears the cart and adds the item.

## Development

```bash
pnpm db:up        # start Postgres (docker compose)
pnpm db:migrate   # apply Prisma migrations
pnpm dev          # run api + web in parallel
```

API docs (Swagger) are served at `http://localhost:3000/api/docs`.
