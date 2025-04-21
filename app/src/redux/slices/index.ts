import { combineReducers } from '@reduxjs/toolkit';
import memberReducer from './memberSlice';
import cartReducer from './cartSlice';
import locationReducer from './locationSlice';

export const rootReducer = combineReducers({
  member: memberReducer,
  cart: cartReducer,
  location: locationReducer
});

export type RootState = ReturnType<typeof rootReducer>;
