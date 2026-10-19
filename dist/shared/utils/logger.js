import winston from 'winston';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const errorLogPath = 'logs/error.log';
const combinedLogPath = 'logs/combined.log';
// Winston's file transports do not create their parent directory.
mkdirSync(dirname(errorLogPath), { recursive: true });
const { combine, timestamp, printf, colorize } = winston.format;
const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});
export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), myFormat),
    transports: [
        new winston.transports.File({ filename: errorLogPath, level: 'error' }),
        new winston.transports.File({ filename: combinedLogPath }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(colorize(), myFormat),
    }));
}
