
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl 
} from '@mui/material';
import { addItem, removeItem } from '../../redux/slices/cartSlice';
import { formatCurrency } from '../../utils/formatters';
import useAlertService from '@/hooks/useAlertService';

interface ProductProps {
  product: any;
}

export const Product: React.FC<ProductProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const alertService = useAlertService();
  const cartItems = useSelector((state: any) => state.cart.items);

  useEffect(() => {
    if (product?.sku && isInCart()) {
      const cartItem = cartItems.find((x:any) => x.sku === product.sku);
      setQuantity(cartItem ? cartItem.quantity : 1);
    } else {
      setQuantity(1);
    }
  }, [product, cartItems]);

  const isInCart = () => 
    !!cartItems.find((x: any) => x.sku === product.sku);

  const handleAddToCart = () => {
    dispatch(addItem({ item: { ...product, quantity } }));
    alertService.successAlert(
      'Item successfully added to your cart.',
      'Go to Cart', 1500,() => navigate('/checkout')
    );
  };

  const handleRemoveFromCart = () => {
    setQuantity(1);
    dispatch(removeItem({ itemId: product.sku }));
    alertService.successAlert(
      'Item successfully removed from your cart.',
      'Go to Cart', 1500,() => navigate('/checkout')
    );
  };

  const handleQuantityChange = (event: any) => {
    const newQuantity = event.target.value;
    setQuantity(newQuantity);
    if (isInCart()) {
      dispatch(addItem({ 
        item: { ...product, quantity: newQuantity } 
      }));
    }
  };

  return (
    <div className="flex-1 flex flex-col items-start card">
      <img 
        className={product.category === 'Hemming' ? 'hemming' : 'img'}
        src={product.url}
        alt={product.name}
        loading="lazy"
      />
      
      <p className="font-bold mt-1 mb-1">{product.name}</p>
      
      <div className="w-full flex justify-between items-center gap-2.5">
        <div className="flex items-center">
          <p className="font-bold m-0 mr-1">Qty:</p>
          <FormControl className="w-20">
            <Select
              value={quantity}
              onChange={handleQuantityChange}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <MenuItem key={num} value={num}>{num}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <p>{formatCurrency(product.cost)}</p>
      </div>

      {product.ext?.nonReturnable && (
        <small className="text-red-500 mt-2.5 mb-2.5">Non Returnable</small>
      )}

      {!isInCart() ? (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          className="h-10 mb-2.5"
          onClick={handleAddToCart}
        >
          Add to Bag
        </Button>
      ) : (
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          className="h-10 mb-2.5 stroked-btn"
          onClick={handleRemoveFromCart}
        >
          Remove from Bag
        </Button>
      )}
    </div>
  );
};
