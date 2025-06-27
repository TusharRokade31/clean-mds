import adminRoutes from './routes/adminRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import stateRoutes from './routes/stateRoutes.js';
import stayRoutes from './routes/stayRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';


const registerRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/states', stateRoutes);
  app.use('/api/stays', stayRoutes);
};

export default registerRoutes;