import adminRoutes from './adminRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import stateRoutes from './stateRoutes.js';
import stayRoutes from './stayRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';


const registerRoutes = (app) => {
  app.use('/',authRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/states', stateRoutes);
  app.use('/api/stays', stayRoutes);
};

export default registerRoutes;