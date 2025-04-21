import React from 'react';
import { Button } from '@mui/material';
import type { Coupon } from '../../models/coupon';

interface CouponSummaryProps {
  couponList: Coupon[];
  totalPoints: number;
  onCancel: () => void;
  onPurchase: () => void;
}

export const CouponSummary: React.FC<CouponSummaryProps> = ({
  couponList,
  totalPoints,
  onCancel,
  onPurchase
}) => {
  return (
    <div className="flex justify-center mt-12">
      <div className="flex flex-col gap-5 w-[500px] bg-light-primary p-5 rounded-lg border-2 border-primary">
        <h3 className="text-center text-primary">Coupon Purchase Summary</h3>
        
        {couponList.map((coupon) => 
          coupon.count ? (
            <div key={coupon.name} className="flex justify-between items-center">
              <h4>{coupon.desc} X {coupon.count}</h4>
              <h3>{(coupon.ext.rewardCost * coupon.count).toLocaleString()}</h3>
            </div>
          ) : null
        )}

        <div className="flex justify-between items-center">
          <h3>RR Points to Spend</h3>
          <h2>{totalPoints.toLocaleString()}</h2>
        </div>
      </div>

      <div className="flex justify-end items-center gap-5 mr-5 mt-7">
        <Button onClick={onCancel}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary" 
          className="h-12 w-36"
          onClick={onPurchase}
        >
          Purchase
        </Button>
      </div>
    </div>
  );
};