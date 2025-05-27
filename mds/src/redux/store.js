// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import locationReducer from './features/location/locationSlice';
import propertyReducer from './features/property/propertySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    property: propertyReducer,
    // Add other reducers here as needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});