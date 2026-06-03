import cron from 'node-cron';
import { prisma } from '../prismaClient.js';

// Job chạy mỗi ngày lúc nửa đêm - xóa story đã hết hạn
cron.schedule('0 0 * * *', async () => {
    try {
        const deleted = await prisma.story.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
        console.log(`Da xoa ${deleted.count} story het han`);
    } catch (err) {
        console.error('Loi khi chay cleanup job:', err);
    }
});
