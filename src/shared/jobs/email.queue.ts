import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

export const emailQueue = new Queue('emailQueue', { connection });

export const addEmailToQueue = async (emailData) => {
  await emailQueue.add('sendEmail', emailData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
};
