import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Card, CardContent, IconButton, Divider } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { CouponCard } from './CouponCard';
import { CouponSummary } from './CouponSummary';
import { useActivityService } from '../../hooks/useActivityService';
import { useAlertService } from '../../hooks/useAlertService';
import type { Member } from '../../models/member';
import type { Coupon } from '../../models/coupon';

interface BuyCouponProps {
  onClose: (refresh?: boolean) => void;
  memberInfo: Member;
  refresh?: boolean;
}

export const BuyCoupon: React.FC<BuyCouponProps> = ({ onClose, memberInfo, refresh }) => {
  const [couponList, setCouponList] = useState<Coupon[]>([]);
  const activityService = useActivityService();
  const alertService = useAlertService();

  useEffect(() => {
    if (memberInfo) {
      getCoupons();
    }
  }, [memberInfo]);

  useEffect(() => {
    if (refresh) {
      clearCoupons();
    }
  }, [refresh]);

  const getCoupons = () => {
    activityService.getCoupons().subscribe({
      next: (coupons: Coupon[]) => {
        setCouponList(coupons);
      },
      error: (error) => {
        alertService.errorAlert(error?.error?.error || error?.message);
      },
    });
  };

  const clearCoupons = () => {
    setCouponList(prev => prev.map(coupon => ({ ...coupon, count: 0 })));
  };

  const hasCoupons = () => couponList.some(coupon => coupon.count);

  const totalPoints = () => 
    couponList.reduce((acc, c) => ((c.count ?? 0) * c.ext.rewardCost) + acc, 0);

  const handleBuyCoupon = async () => {
    if (totalPoints() > memberInfo.purses[0].availBalance) {
      alertService.errorAlert('Not enough points to buy the selected coupons');
      return;
    }

    const requests = couponList
      .filter(coupon => coupon.count)
      .flatMap(coupon => 
        Array(coupon.count).fill(null).map(() => 
          activityService.getActivity({
            type: 'Redemption',
            date: new Date(),
            srcChannelType: 'Web',
            loyaltyID: +memberInfo.loyaltyId,
            couponCode: coupon.name,
          })
        )
      );

    try {
      await Promise.all(requests);
      onClose(true);
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-5 pb-0 mb-2.5">
        <h3 className="m-0">Buy Coupons</h3>
        <IconButton onClick={() => onClose()}>
          <CloseIcon />
        </IconButton>
      </div>
      
      <Divider />
      
      <div className="flex justify-end items-center gap-5 mr-4 mt-2.5">
        <div className="flex flex-col mr-2.5">
          <div className="text-gray-500">Points Available</div>
          <h1 className="text-primary text-left mt-0 mb-0">
            {memberInfo.purses[0].availBalance.toLocaleString()}
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 pl-10 pt-5">
        {couponList.map((coupon) => (
          <CouponCard 
            key={coupon.name}
            coupon={coupon}
            onCountChange={(newCount) => {
              setCouponList(prev => 
                prev.map(c => c.name === coupon.name ? { ...c, count: newCount } : c)
              );
            }}
          />
        ))}
      </div>

      {hasCoupons() && (
        <CouponSummary 
          couponList={couponList}
          totalPoints={totalPoints()}
          onCancel={() => onClose()}
          onPurchase={handleBuyCoupon}
        />
      )}
    </div>
  );
};