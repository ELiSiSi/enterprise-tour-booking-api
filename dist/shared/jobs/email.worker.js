import { Worker } from 'bullmq';
import { logger } from '../utils/logger.js';
import { Email } from '../utils/email.js';
const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
};
export const emailWorker = new Worker('emailQueue', async (job) => {
    const { user, url, template, subject } = job.data;
    logger.info(`Processing email job ${job.id} for ${user.email}`);
    const emailInstance = new Email(user, url);
    await emailInstance.send(template, subject);
}, { connection });
emailWorker.on('completed', (job) => {
    logger.info(`Email job ${job.id} has completed successfully!`);
});
emailWorker.on('failed', (job, err) => {
    logger.error(`Email job ${job.id} has failed with ${err.message}`);
});
