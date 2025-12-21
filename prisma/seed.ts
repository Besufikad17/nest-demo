import { PrismaClient } from "generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
	await prisma.roles.createMany({
		data: [
			{
				roleName: "user",
				description: "user of the system"
			},
			{
				roleName: "admin",
				description: "admin of the system"
			}
		],
		skipDuplicates: true
	});
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	});
