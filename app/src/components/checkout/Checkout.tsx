import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Divider, FormControl, MenuItem, Select, TextField } from '@mui/material';
import { useActivityService } from '../../hooks/useActivityService';
import { useMemberService } from '../../hooks/useMemberService';
import { CartItems } from './components/CartItems';
import { PaymentSection } from './components/PaymentSection';
import { OrderSummary } from './components/OrderSummary';
import useAlertService from '@/hooks/useAlertService';

const Checkout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getActivity } = useActivityService();
  const { refreshMember } = useMemberService();
  const { errorAlert } = useAlertService();

  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentType, setPaymentType] = useState('CREDIT_CARD');
  const [shippingType, setShippingType] = useState('');
  const [shippingProducts, setShippingProducts] = useState<any[]>([]);
  const [shippingList, setShippingList] = useState<string[]>([]);
  const [isReturn, setIsReturn] = useState(false);
  const [returningItems, setReturningItems] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [maxAllowedValue, setMaxAllowedValue] = useState(0);
  const [isHemmingAvailable, setIsHemmingAvailable] = useState(false);
  const [subTotal, setSubTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [tax, setTax] = useState(0);
  const [earnSummary, setEarnSummary] = useState<any>({});
  const [bestOffers, setBestOffers] = useState<any[]>([]);
  const [discountLineItems, setDiscountLineItems] = useState<any[]>([]);
  const [returnOrderHistory, setReturnOrderHistory] = useState<any>(null);
  const [returnDate, setReturnDate] = useState<string | null>(null);

  useEffect(() => {
    // Initialize checkout data
    const initializeCheckout = async () => {
      try {
        // Fetch shipping products, tax info, etc.
        // Update state with fetched data
        setIsLoading(false);
      } catch (error: any) {
        errorAlert(error?.error?.error || error?.message);
        setIsLoading(false);
      }
    };

    initializeCheckout();
  }, []);

  const handlePurchase = async () => {
    try {
      if (isReturn) {
        // Handle return flow
        await handleReturnPurchase();
      } else {
        // Handle normal purchase flow
        await handleNormalPurchase();
      }
      
      navigate('/purchase-confirmation');
      refreshMember();
    } catch (error: any) {
      errorAlert(error?.error?.error || error?.message);
    }
  };

  const handleReturnPurchase = async () => {
    // Implementation for return purchase
  };

  const handleNormalPurchase = async () => {
    // Implementation for normal purchase
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <div className="loader"></div>
      </Box>
    );
  }

  return (
    <div className="flex flex-row justify-center items-center flex-1">
      <div className="flex flex-row justify-start items-start flex-[70%] gap-6 bg-white p-5">
        <div className="flex flex-col justify-evenly flex-[70%] gap-1">
          <h1>{isReturn ? 'Return' : 'Purchase'}</h1>
          
          <CartItems 
            cartItems={cartItems}
            isReturn={isReturn}
            onRemoveItem={(item) => {/* handle remove */}}
            onQuantityChange={(item, quantity) => {/* handle quantity change */}}
          />

          <PaymentSection 
            paymentType={paymentType}
            shippingType={shippingType}
            onPaymentChange={setPaymentType}
            onShippingChange={setShippingType}
          />

          <OrderSummary 
            subTotal={subTotal}
            taxAmount={taxAmount}
            totalAmount={totalAmount}
            earnSummary={earnSummary}
            onPurchase={handlePurchase}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;