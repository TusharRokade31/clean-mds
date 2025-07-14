// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import locationReducer from './features/location/locationSlice';
import propertyReducer from './features/property/propertySlice';
import privacyPolicyReducer from './features/privacyPolicy/privacyPolicySlice';
import bookingReducer from './features/bookings/bookingSlice';
import roomReducer from './features/rooms/roomSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    property: propertyReducer,
    privacyPolicy: privacyPolicyReducer,
    booking: bookingReducer,
    rooms: roomReducer,
    // Add other reducers here as needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});