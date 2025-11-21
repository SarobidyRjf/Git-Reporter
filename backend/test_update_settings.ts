
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        const user = await prisma.user.findFirst();

        if (!user) {
            console.log('No user found to test update.');
            return;
        }

        console.log(`Found user: ${user.id}`);
        console.log('Attempting to update visibleRepos...');

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                visibleRepos: ['test-repo-1', 'test-repo-2']
            }
        });

        console.log('Update successful!');
        console.log('Updated visibleRepos:', updatedUser.visibleRepos);

    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
