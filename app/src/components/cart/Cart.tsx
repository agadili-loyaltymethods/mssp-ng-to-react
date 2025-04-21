import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, MenuItem, IconButton, Badge } from '@mui/material';
import { ShoppingCart as CartIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { removeItem } from '../../redux/slices/cartSlice';
import { formatCurrency } from '../../utils/formatters';

export const Cart: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const cartItems = useSelector((state: any) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((total: number, item: any) => 
    total + (item.quantity || 0), 0);

  const totalPrice = cartItems.reduce((total: number, item: any) => 
    total + (item.cost * item.quantity), 0);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveItem = (product: any) => {
    dispatch(removeItem({ itemId: product.sku }));
  };

  const handleCheckout = () => {
    handleMenuClose();
    navigate('/checkout');
  };

  return (
    <div className="flex">
      <h5 className="cursor-pointer flex items-center" onClick={handleMenuOpen}>
        <span className="cart-count pt-12">
          <CartIcon />
          <em>{totalItems}</em>
        </span>
      </h5>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className="cart-dropdown"
      >
        <div className="flex flex-col w-full cart-dropdown">
          <div className="product-list w-full flex-auto" onClick={(e) => e.stopPropagation()}>
            <div className="container w-full mb-2.5">
              {cartItems.length > 0 ? (
                cartItems.map((product: any) => (
                  <div key={product.sku} className="flex items-center">
                    <img 
                      className="w-1/5" 
                      src={product.url} 
                      alt={product.name} 
                      title={product.desc} 
                      loading="lazy" 
                    />
                    <small className="flex-[60%] flex flex-col gap-1 pl-1">
                      <strong className="mb-2.5">{product.name}</strong>
                      <strong>{product.quantity} x {formatCurrency(product.cost)}</strong>
                    </small>
                    <IconButton 
                      className="flex-[20%]" 
                      onClick={() => handleRemoveItem(product)}
                    >
                      <DeleteIcon color="error" className="text-2xl" />
                    </IconButton>
                  </div>
                ))
              ) : (
                <>
                  <p className="text-lg font-bold">Your cart is empty!</p>
                  <p>Start adding items to your cart to see them here.</p>
                </>
              )}
            </div>
          </div>

          {cartItems.length > 0 && (
            <div className="checkout-footer w-full p-2.5 bg-white shadow-md">
              <small>Cart Total</small>
              <strong>{formatCurrency(totalPrice)}</strong>
              <button 
                className="w-full mt-2.5 bg-primary text-white py-2 rounded"
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </Menu>
    </div>
  );
};