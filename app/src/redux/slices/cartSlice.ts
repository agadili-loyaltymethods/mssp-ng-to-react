import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../../types';

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: []
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ item: CartItem }>) => {
      const existingItem = state.items.find(product => product.sku === action.payload.item.sku);
      
      if (existingItem) {
        state.items = state.items.map(product =>
          product.sku === action.payload.item.sku 
            ? { ...product, quantity: action.payload.item.quantity } 
            : product
        );
      } else {
        state.items.push(action.payload.item);
      }
    },
    removeItem: (state, action: PayloadAction<{ itemId: string }>) => {
      state.items = state.items.filter(item => item.sku !== action.payload.itemId);
    },
    clearCart: () => initialState
  }
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
