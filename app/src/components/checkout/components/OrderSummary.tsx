import React from 'react';
import { Button } from '@mui/material';
import { formatCurrency } from '../../../utils/formatters';

interface OrderSummaryProps {
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  earnSummary: any;
  onPurchase: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  subTotal,
  taxAmount,
  totalAmount,
  earnSummary,
  onPurchase
}) => {
  return (
    <div className="border-gray rounded-lg p-4">
      <h3>Order Summary</h3>
      
      <div className="flex justify-between mb-2">
        <span>Subtotal</span>
        <span>{formatCurrency(subTotal)}</span>
      </div>

      <div className="flex justify-between mb-2">
        <span>Tax</span>
        <span>{formatCurrency(taxAmount)}</span>
      </div>

      <div className="flex justify-between mb-4">
        <span className="font-bold">Total</span>
        <span className="font-bold">{formatCurrency(totalAmount)}</span>
      </div>

      {Object.keys(earnSummary).map((key) => (
        <div key={key} className="mb-4">
          <h4>{key}</h4>
          {earnSummary[key].map((item: any, index: number) => (
            <div key={index} className="flex justify-between mb-2">
              <span>{item.description}</span>
              <span>{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      ))}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={onPurchase}
        className="mt-4"
      >
        Complete Purchase
      </Button>
    </div>
  );
};