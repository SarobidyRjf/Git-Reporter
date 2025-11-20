
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking users in database...');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log('------------------------------------------------');
        console.log(`User: ${user.name} (${user.email})`);
        console.log(`ID: ${user.id}`);
        console.log(`GitHub ID: ${user.githubId}`);
        console.log(`Has GitHub Token: ${!!user.githubToken}`);
        if (user.githubToken) {
            console.log(`Token Length: ${user.githubToken.length}`);
            console.log(`Token Preview: ${user.githubToken.substring(0, 10)}...`);
        } else {
            console.log('Token is MISSING or NULL');
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
