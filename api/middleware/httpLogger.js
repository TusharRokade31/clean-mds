import  morgan from 'morgan';
import logger from '../utils/logger.js';

const stream = {
  write: (message, encoding) => {
    // Enhance log with source info
    logger.info(message.trim(), {
      source: {
        ip: global._currentReq?.ip,
        userAgent: global._currentReq?.get('User-Agent'),
        referrer: global._currentReq?.get('referrer'),
        userId: global._currentReq?.user?._id || 'Unauthenticated',
      },
    });
  },
};

morgan.token('source', (req) => {
  const userId = req.user?._id || 'Unauthenticated';
  const userAgent = req.get('User-Agent');
  const ip = req.ip;
  return `source={ userId: ${userId}, ip: ${ip}, userAgent: ${userAgent} }`;
});


export const httpLogger = morgan(
    ':method :url :status :res[content-length] - :response-time ms :source',
  { stream },
//   ':method :url :status :response-time ms - :res[content-length]',
//   { stream: logger.stream }
);

