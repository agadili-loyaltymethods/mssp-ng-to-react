import React from 'react';
import { Card, IconButton, MenuItem, Select } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { formatCurrency } from '../../../utils/formatters';
import { NoData } from '@/components/common/no-data/NoData';

interface CartItemsProps {
  cartItems: any[];
  isReturn: boolean;
  onRemoveItem: (item: any) => void;
  onQuantityChange: (item: any, quantity: number) => void;
}

export const CartItems: React.FC<CartItemsProps> = ({
  cartItems,
  isReturn,
  onRemoveItem,
  onQuantityChange
}) => {
  if (!cartItems?.length) {
    return <NoData>No products are available in the cart.</NoData>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <h3>My Bag ({cartItems.length})</h3>
        {cartItems.length > 0 && (
          <button 
            className="remove-all-btn"
            onClick={() => {/* handle clear cart */}}
          >
            <span className="text-sm text-black">
              {isReturn ? 'Return All Items' : 'Remove All Items'}
            </span>
          </button>
        )}
      </div>

      {cartItems.map((item, index) => (
        !item?.ext?.hideInMSSP && (
          <Card key={index} className="p-5 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-1/6">
                <img src={item.url} alt={item.name} className="w-full h-auto" />
              </div>
              
              <div className="flex-1">
                <h4>{item.name}</h4>
                <p>{formatCurrency(item.cost)}</p>
              </div>

              <Select
                value={item.quantity}
                onChange={(e) => onQuantityChange(item, Number(e.target.value))}
                disabled={isReturn}
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </Select>

              <div className="text-right">
                <p>{formatCurrency(item.cost * item.quantity)}</p>
                {!isReturn && (
                  <IconButton onClick={() => onRemoveItem(item)}>
                    <Delete />
                  </IconButton>
                )}
              </div>
            </div>
          </Card>
        )
      ))}
    </div>
  );
};