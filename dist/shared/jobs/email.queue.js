import { Queue } from 'bullmq';
let emailQueue;
const getEmailQueue = () => {
    if (!emailQueue) {
        emailQueue = new Queue('emailQueue', {
            connection: {
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: Number(process.env.REDIS_PORT || 6379),
            },
        });
    }
    return emailQueue;
};
export const addEmailToQueue = async (emailData) => {
    await getEmailQueue().add('sendEmail', emailData, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    });
};
