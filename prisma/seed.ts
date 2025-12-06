import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function main() {
	await prisma.roles.createMany({
		data: [
			{
				roleName: 'user',
				description: 'user of the system'
			},
			{
				roleName: 'admin',
				description: 'admin of the system'
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
