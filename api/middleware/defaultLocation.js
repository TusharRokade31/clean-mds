// middleware/defaultLocation.js
import trendingLocations from '../utils/trendingLocations.js';

export const setDefaultLocation = (req, res, next) => {
  if (!req.query.location) {
    // Pick the first trending location (or random one)
    req.query.location = trendingLocations[0]; // or use random logic
  }
  next();
};

