import cron from 'node-cron';
import { prisma } from '../prismaClient.js';
import cloudinary from '../configs/cloudinary.js';

// Schedule a cleanup job to run every day at midnight
cron.schedule(' 0 0 * * *', async () => {
    try {
        const deleted = await prisma.story.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
        console.log(`Deleted ${deleted.count} expired stories`);
    } catch (err) {
        console.error('Error during cleanup job:', err);
    }
    });