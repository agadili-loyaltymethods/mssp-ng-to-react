import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { addItem, removeItem, clearCart } from '../redux/slices/cartSlice';
import { CartItem } from '../types';

export const useCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const addToCart = (item: CartItem) => {
    dispatch(addItem({ item }));
  };

  const removeFromCart = (itemId: string) => {
    dispatch(removeItem({ itemId }));
  };

  const clearCartItems = () => {
    dispatch(clearCart());
  };

  const isInCart = (sku: string) => {
    return cartItems.some(item => item.sku === sku);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.cost * item.quantity), 0);
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCartItems,
    isInCart,
    getCartTotal
  };
};
