
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing DB write for githubToken...');

    // Create a dummy user
    const dummyId = 'test-user-' + Date.now();
    console.log(`Creating dummy user: ${dummyId}`);

    const user = await prisma.user.create({
        data: {
            githubId: dummyId,
            name: 'Test User',
            email: 'test@example.com',
            githubToken: 'test-token-123',
        },
    });

    console.log('User created. ID:', user.id);
    console.log('Token in object returned by create:', user.githubToken);

    // Fetch it back
    const fetchedUser = await prisma.user.findUnique({
        where: { id: user.id },
    });

    console.log('Fetched user token:', fetchedUser?.githubToken);

    if (fetchedUser?.githubToken === 'test-token-123') {
        console.log('SUCCESS: Token was saved and retrieved.');
    } else {
        console.log('FAILURE: Token was NOT saved or retrieved.');
    }

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
