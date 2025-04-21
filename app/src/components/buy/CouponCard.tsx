import React from 'react';
import { Card, CardContent, CardActions, IconButton } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import type { Coupon } from '../../models/coupon';

interface CouponCardProps {
  coupon: Coupon;
  onCountChange: (count: number) => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, onCountChange }) => {
  return (
    <Card className="flex-[0_0_45%]">
      <CardContent>
        <h2 className="text-primary mb-5">{coupon.desc}</h2>
        <div className="flex items-center">
          <h2 className="text-primary mr-1">{coupon.ext.rewardCost}</h2>
          <p className="text-gray-500">RR Points</p>
        </div>
      </CardContent>
      <CardActions className="flex justify-center items-center relative">
        <div className="circle-1" />
        <div className="circle-2" />
        <div className="flex justify-between items-center w-40">
          <IconButton 
            disabled={!coupon.count} 
            onClick={() => onCountChange(coupon.count ? coupon.count - 1 : 0)}
          >
            <RemoveIcon />
          </IconButton>
          <h3>{coupon.count ?? 0}</h3>
          <IconButton onClick={() => onCountChange(coupon.count ? coupon.count + 1 : 1)}>
            <AddIcon />
          </IconButton>
        </div>
      </CardActions>
    </Card>
  );
};