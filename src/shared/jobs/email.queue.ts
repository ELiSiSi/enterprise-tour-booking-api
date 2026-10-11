import { Queue } from 'bullmq';

export interface EmailJobData {
  user: {
    email: string;
    name: string;
  };
  url: string;
  template: 'welcome' | 'passwordReset';
  subject: string;
}

let emailQueue: Queue<EmailJobData> | undefined;

const getEmailQueue = () => {
  if (!emailQueue) {
    emailQueue = new Queue<EmailJobData>('emailQueue', {
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
      },
    });
  }

  return emailQueue;
};

export const addEmailToQueue = async (emailData: EmailJobData) => {
  await getEmailQueue().add('sendEmail', emailData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
};
