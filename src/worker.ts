import 'dotenv/config';
import { emailWorker } from './shared/jobs/email.worker.js';

const shutdown = async () => {
  await emailWorker.close();
  process.exit(0);
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
