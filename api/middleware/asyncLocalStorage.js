// middleware/asyncContext.js
import { AsyncLocalStorage } from 'async_hooks';

export const asyncStorage = new AsyncLocalStorage();

export const asyncContextMiddleware = (req, res, next) => {
  const store = new Map();
  store.set('requestId', `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`);
  store.set('userId', req.user?._id || 'guest');
  store.set('ip', req.ip);

  asyncStorage.run(store, () => {
    next();
  });
};
