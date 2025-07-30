import { createLogger, transports, format } from 'winston';
import { asyncStorage } from '../middleware/asyncLocalStorage.js';
import  DailyRotateFile  from 'winston-daily-rotate-file';
import path from 'path';


const customFormat = format.printf(({ level, message, meta, timestamp }) => {
  const store = asyncStorage.getStore();
  const context = store ? {
    requestId: store.get('requestId'),
    userId: store.get('userId'),
    ip: store.get('ip'),
  } : {};

  return `${timestamp} [${level}] ${message} ${JSON.stringify(context)}`;
});
const fileTransport = new DailyRotateFile({
  dirname: './logs',
  filename: 'app-%DATE%',
  extension: '.log', // becomes: app-2025-04-05.log → but we'll customize
  json: false,
  zippedArchive: false, // set to true in production to compress old logs
  maxSize: '5m',        // Rotate after 5 MB      
  auditFile: path.join('./logs', 'audit.json'), // tracks rotated files
  // Customize filename to include counter if multiple files per day
  createSymlink: true,
  symlinkName: 'app-current.log',
});

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    customFormat,
  ),
  transports: [fileTransport],
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format,
      ),
    }),
  );
}


export default logger;