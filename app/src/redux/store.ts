import { configureStore } from '@reduxjs/toolkit';
import memberReducer from './slices/memberSlice';
import cartReducer from './slices/cartSlice';
import locationReducer from './slices/locationSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    member: memberReducer,
    cart: cartReducer,
    location: locationReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
