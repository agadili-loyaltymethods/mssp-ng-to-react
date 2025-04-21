import React from 'react';
import { FormControl, MenuItem, Select } from '@mui/material';
import { PaymentCards } from '../../../enums/cc-type';

interface PaymentSectionProps {
  paymentType: string;
  shippingType: string;
  onPaymentChange: (type: string) => void;
  onShippingChange: (type: string) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  paymentType,
  shippingType,
  onPaymentChange,
  onShippingChange
}) => {
  return (
    <div className="border-gray rounded-lg p-4">
      <h3>Payment Type</h3>
      <FormControl fullWidth>
        <Select
          value={paymentType}
          onChange={(e) => onPaymentChange(e.target.value)}
        >
          {Object.entries(PaymentCards).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <h3 className="mt-4">Shipping</h3>
      <FormControl fullWidth>
        <Select
          value={shippingType}
          onChange={(e) => onShippingChange(e.target.value)}
        >
          {/* Shipping options here */}
        </Select>
      </FormControl>
    </div>
  );
};