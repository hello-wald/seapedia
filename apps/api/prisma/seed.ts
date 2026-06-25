import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

interface SeedProduct {
	id: string;
	name: string;
	description: string;
	price: number;
	stock: number;
}

interface SeedStore {
	sellerName: string;
	sellerEmail: string;
	storeName: string;
	storeDescription: string;
	products: SeedProduct[];
}

const SELLER_PASSWORD = process.env.SELLER_PASSWORD ?? "seller123";
const BUYER_PASSWORD = process.env.BUYER_PASSWORD ?? "buyer123";
const BUYER_INITIAL_BALANCE = 500000;

const stores: SeedStore[] = [
	{
		sellerName: "GadgetKu Owner",
		sellerEmail: "gadgetku@seapedia.local",
		storeName: "GadgetKu",
		storeDescription: "Electronics & gadgets · Surabaya",
		products: [
			{
				id: "seed-gadgetku-1",
				name: "Bluetooth Noise-Cancelling Headset",
				description:
					"Over-ear wireless headset with active noise cancellation and 30-hour battery life.",
				price: 249000,
				stock: 40,
			},
			{
				id: "seed-gadgetku-2",
				name: "Waterproof AMOLED Smartwatch",
				description:
					"Fitness smartwatch with vivid AMOLED display, heart-rate sensor, and 5ATM water resistance.",
				price: 512000,
				stock: 25,
			},
		],
	},
	{
		sellerName: "SportLine Owner",
		sellerEmail: "sportline@seapedia.local",
		storeName: "SportLine",
		storeDescription: "Sportswear & apparel · Bandung",
		products: [
			{
				id: "seed-sportline-1",
				name: "Lightweight Anti-Slip Running Shoes",
				description:
					"Breathable running shoes with anti-slip outsole and cushioned midsole.",
				price: 389000,
				stock: 60,
			},
			{
				id: "seed-sportline-2",
				name: "Premium Cotton Oversized T-Shirt",
				description:
					"Soft combed-cotton oversized tee, pre-shrunk and available in neutral tones.",
				price: 99000,
				stock: 120,
			},
		],
	},
	{
		sellerName: "HijauAsri Owner",
		sellerEmail: "hijauasri@seapedia.local",
		storeName: "HijauAsri",
		storeDescription: "Plants & specialty goods · Yogyakarta",
		products: [
			{
				id: "seed-hijauasri-1",
				name: "Monstera Plant in Ceramic Pot",
				description:
					"Healthy Monstera deliciosa in a handmade ceramic pot, ready to brighten any room.",
				price: 135000,
				stock: 30,
			},
			{
				id: "seed-hijauasri-2",
				name: "Single-Origin Arabica Coffee Beans",
				description:
					"250g of medium-roast single-origin Arabica beans from the Gayo highlands.",
				price: 78000,
				stock: 80,
			},
		],
	},
];

async function seedAdmin() {
	const email = process.env.ADMIN_EMAIL ?? "admin@seapedia.local";
	const password = process.env.ADMIN_PASSWORD ?? "admin12345";
	const passwordHash = await hash(password, 10);

	const admin = await prisma.user.upsert({
		where: { email },
		update: {},
		create: {
			name: "SEApedia Admin",
			email,
			password: passwordHash,
			roles: { create: [{ role: Role.ADMIN }] },
		},
		include: { roles: true },
	});

	console.log(
		`✅ Seeded admin: ${admin.email} (roles: ${admin.roles.map((r) => r.role).join(", ")})`,
	);
}

async function seedStores() {
	const sellerPasswordHash = await hash(SELLER_PASSWORD, 10);

	for (const config of stores) {
		const seller = await prisma.user.upsert({
			where: { email: config.sellerEmail },
			update: {},
			create: {
				name: config.sellerName,
				email: config.sellerEmail,
				password: sellerPasswordHash,
				roles: { create: [{ role: Role.SELLER }] },
			},
		});

		const store = await prisma.store.upsert({
			where: { name: config.storeName },
			update: { description: config.storeDescription },
			create: {
				name: config.storeName,
				description: config.storeDescription,
				sellerId: seller.id,
			},
		});

		for (const product of config.products) {
			await prisma.product.upsert({
				where: { id: product.id },
				update: {
					name: product.name,
					description: product.description,
					price: product.price,
					stock: product.stock,
					storeId: store.id,
				},
				create: {
					id: product.id,
					name: product.name,
					description: product.description,
					price: product.price,
					stock: product.stock,
					storeId: store.id,
				},
			});
		}

		console.log(
			`✅ Seeded store "${store.name}" (${config.sellerEmail}) with ${config.products.length} products`,
		);
	}
}

async function seedBuyer() {
	const email = "buyer@seapedia.local";
	const passwordHash = await hash(BUYER_PASSWORD, 10);

	const buyer = await prisma.user.upsert({
		where: { email },
		update: {},
		create: {
			name: "Demo Buyer",
			email,
			password: passwordHash,
			roles: { create: [{ role: Role.BUYER }] },
		},
	});

	const buyerWallet = await prisma.wallet.upsert({
		where: { userId: buyer.id },
		update: {},
		create: {
			userId: buyer.id,
			balance: BUYER_INITIAL_BALANCE,
		},
	});

	await prisma.walletTransaction.upsert({
		where: { id: "seed-buyer-topup-1" },
		update: {},
		create: {
			id: "seed-buyer-topup-1",
			walletId: buyerWallet.id,
			type: "TOPUP",
			amount: BUYER_INITIAL_BALANCE,
			balanceAfter: BUYER_INITIAL_BALANCE,
			description: "Initial wallet top-up",
		},
	});

	await prisma.address.upsert({
		where: { id: "seed-buyer-address-1" },
		update: {},
		create: {
			id: "seed-buyer-address-1",
			userId: buyer.id,
			label: "Home",
			recipientName: "Demo Buyer",
			phone: "081234567890",
			line1: "Jl. Merdeka No. 1",
			city: "Jakarta",
			province: "DKI Jakarta",
			postalCode: "10110",
			isDefault: true,
		},
	});

	console.log(
		`✅ Seeded buyer: ${buyer.email} (balance: ${BUYER_INITIAL_BALANCE}, 1 address)`,
	);
}

async function seedDiscounts() {
	const day = 24 * 60 * 60 * 1000;
	const now = Date.now();
	const in30Days = new Date(now + 30 * day);
	const yesterday = new Date(now - day);

	const vouchers = [
		{
			code: "HEMAT10",
			percent: 10,
			expiresAt: in30Days,
			usageLimit: 5,
			usedCount: 0,
		},
		{
			code: "EXPIRED5",
			percent: 5,
			expiresAt: yesterday,
			usageLimit: 5,
			usedCount: 0,
		},
		{
			code: "HABIS",
			percent: 15,
			expiresAt: in30Days,
			usageLimit: 3,
			usedCount: 3,
		},
	];
	for (const v of vouchers) {
		await prisma.voucher.upsert({
			where: { code: v.code },
			update: {
				percent: v.percent,
				expiresAt: v.expiresAt,
				usageLimit: v.usageLimit,
				usedCount: v.usedCount,
			},
			create: v,
		});
	}

	await prisma.promo.upsert({
		where: { code: "PROMO20" },
		update: { percent: 20, expiresAt: in30Days },
		create: { code: "PROMO20", percent: 20, expiresAt: in30Days },
	});

	console.log(
		`✅ Seeded discounts: ${vouchers.length} vouchers + 1 promo (HEMAT10, EXPIRED5, HABIS, PROMO20)`,
	);
}

async function main() {
	await seedAdmin();
	await seedStores();
	await seedBuyer();
	await seedDiscounts();
	console.log("🌱 Seeding complete.");
}

main()
	.then(() => prisma.$disconnect())
	.catch(async (err) => {
		console.error(err);
		await prisma.$disconnect();
		process.exit(1);
	});
