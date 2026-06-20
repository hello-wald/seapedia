import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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
			roles: {
				create: [{ role: Role.ADMIN }],
			},
		},
		include: { roles: true },
	});

	console.log(
		`✅ Seeded admin user: ${admin.email} (roles: ${admin.roles.map((r) => r.role).join(", ")})`,
	);
}

main()
	.then(() => prisma.$disconnect())
	.catch(async (err) => {
		console.error(err);
		await prisma.$disconnect();
		process.exit(1);
	});
