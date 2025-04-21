
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Drawer,
  Card, 
  CardContent,
  Button,
  Chip
} from '@mui/material';
import { ChipSet } from '@material/react-chips';
import { useActivityService } from '../../hooks/useActivityService';
import { useMemberService } from '../../hooks/useMemberService';
import { formatCurrency } from '../../utils/formatters';
import useAlertService from '@/hooks/useAlertService';

export const RewardsWallet: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [memberVouchers, setMemberVouchers] = useState([]);
  const [selectedPointPurse, setSelectedPointPurse] = useState<any>({});
  const [memberPoints, setMemberPoints] = useState<any[]>([]);

  const memberInfo = useSelector((state: any) => state.member);
  const activityService = useActivityService();
  const alertService = useAlertService();
  const memberService = useMemberService();

  useEffect(() => {
    if (memberInfo?._id) {
      getRewardWallet();
    }
  }, [memberInfo]);

  const getRewardWallet = async () => {
    try {
      const response: any = await activityService.getActivity(getPayload());
      const pointsData = response.data.rdBalances;
      setMemberPoints(Object.keys(pointsData).map((key:any) => ({
        key,
        value: pointsData[key]
      })));
      getVouchers();
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    }
  };

  // Additional helper functions would go here
  // Including getVouchers, handleBuyVoucher, etc.

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
    >
      <div className="flex flex-col">
        {/* Drawer content */}
        {/* Vouchers list */}
        {/* Points selection */}
      </div>
    </Drawer>
  );
};
