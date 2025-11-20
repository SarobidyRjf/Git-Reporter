
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Deleting all users to force fresh login...');
    const deleteReports = await prisma.report.deleteMany();
    const deleteUsers = await prisma.user.deleteMany();
    console.log(`Deleted ${deleteUsers.count} users and ${deleteReports.count} reports.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
