import { createLogger, transports, format } from 'winston';
import { asyncStorage } from '../middleware/asyncLocalStorage.js';


const customFormat = format.printf(({ level, message, timestamp }) => {
  const store = asyncStorage.getStore();
  const context = store ? {
    requestId: store.get('requestId'),
    userId: store.get('userId'),
    ip: store.get('ip')
  } : {};

  return `${timestamp} [${level}] ${message} ${JSON.stringify(context)}`;
});

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    customFormat
  ),
  transports: [
    new transports.File({
      filename: './logs/all-logs.log',
      json: false,
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new transports.Console(),
  ]
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format
      )
    })
  );
}


export default logger;