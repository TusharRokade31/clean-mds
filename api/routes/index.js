import adminRoutes from './adminRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import stateRoutes from './stateRoutes.js';
import stayRoutes from './stayRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import roomRoutes from './roomRoutes.js';
import blogRoutes from './blogRoutes.js';
import voiceSearchRoutes from './voiceSearch.routes.js';
import reviewRoutes from './reviewRoute.js';
import wishlistRoutes from './wishlistRoute.js';
import express from 'express';


const registerRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/states', stateRoutes);
  app.use('/api/stays', stayRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/payments/phonepe/webhook', express.raw({ type: 'application/json' }));
  app.use('/api/stats', dashboardRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use('/api/voice-search', voiceSearchRoutes);
  app.use('/api', roomRoutes);
};

export default registerRoutes;