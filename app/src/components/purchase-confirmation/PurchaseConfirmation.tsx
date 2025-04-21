
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '@material-ui/core';
import { CheckCircle } from '@material-ui/icons';
import { clearCart } from '../../redux/slices/cartSlice';

export const PurchaseConfirmation: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="payment-wrapper h-full">
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center text-green-500 pt-5 mt-7 mb-5 gap-6">
          <CheckCircle className="icon-size-5" />
          <h2>Order Placed Successfully!</h2>
        </div>
        <Button
          variant="contained"
          color="primary"
          className="w-50"
          onClick={() => navigate('/purchase-history')}
        >
          View Purchase History
        </Button>
      </div>
    </div>
  );
};
