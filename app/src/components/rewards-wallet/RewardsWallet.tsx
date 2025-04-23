import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Button,
  IconButton,
  Drawer,
  Chip,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useActivityService } from '@/hooks/useActivityService';
import { useMemberService } from '@/hooks/useMemberService';
import { NoData } from '@/components/common/no-data/NoData';
import { CardMiniSkeleton } from '@/components/skeletons/CardMiniSkeleton';
import { formatExpiryDate } from '@/utils/formatters';
import useAlertService from '@/hooks/useAlertService';
import { checkExpiry } from '@/utils/formatters';
import './rewards-wallet.css';

export const RewardsWallet: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [availableVouchersWithPurse, setAvailableVouchersWithPurse] = useState<any[]>([]);
  const [memberVouchers, setMemberVouchers] = useState<any[]>([]);
  const [selectedPointPurse, setSelectedPointPurse] = useState<any>({});
  const [memberPoints, setMemberPoints] = useState<any[]>([]);

  const memberInfo = useSelector((state: any) => state.member);
  const location = useSelector((state: any) => state.location.location);
  const navigate = useNavigate();
  const activityService = useActivityService();
  const memberService = useMemberService();
  const alertService = useAlertService();

  useEffect(() => {
    if (memberInfo?._id) {
      getRewardWallet();
    }
  }, [memberInfo]);

  useEffect(() => {
    if (location?.location) {
      setDrawerOpen(false);
      getRewardWallet();
    }
  }, [location]);

  const getRewardWallet = async () => {
    setIsLoading(true);
    try {
      const response: any = await activityService.getActivity(getPayload());
      const pointsData = response.data.rdBalances;
      setMemberPoints(Object.keys(pointsData).map(key => ({
        key,
        value: pointsData[key]
      })));
      getVouchers();
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
      setIsLoading(false);
    }
  };

  const getVouchers = async () => {
    try {
      const [memberVouchers, allVouchers]: any = await Promise.all([
        memberService.getMemberVouchers(memberInfo._id),
        memberService.getVouchers(memberInfo)
      ]);

      setMemberVouchers(memberVouchers.flatMap((voucher: any) => voucher.rewards));
      setAvailableVouchers(allVouchers);
      setAvailableVouchersWithPurse(allVouchers);
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPayload = (coupon = '') => ({
    type: coupon || 'Personalization',
    date: new Date().toISOString(),
    srcChannelType: 'Web',
    couponCode: 'Balance',
    srcChannelID: location?.location || 'Corporate',
    loyaltyID: memberInfo?.loyaltyId
  });

  const handlePurseSelection = (selectedPurse: any) => {
    setSelectedPointPurse(selectedPurse);
    setAvailableVouchersWithPurse(
      availableVouchers.filter(voucher =>
        voucher.cost > 0 && voucher.ext.purseName === selectedPurse.key
      )
    );
  };

  const isPointSourceValid = (voucherName: string, cost: number): boolean => {
    const selectedPurse = memberPoints.find(point => point.key === selectedPointPurse.key);
    return selectedPurse && selectedPurse.value >= cost;
  };

  const buyVoucher = async (rewardName: string) => {
    setIsLoading(true);
    try {
      await activityService.getActivity({
        type: 'Redemption',
        srcChannelType: 'Web',
        srcChannelID: location.location,
        date: new Date(),
        loyaltyID: memberInfo?.loyaltyId,
        couponCode: rewardName,
        ext: {
          purse: selectedPointPurse.key
        }
      }, true);
      memberService.refreshMember();
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-50">
        <CardMiniSkeleton />
      </div>
    );
  }

  return (
    <>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        classes={{ paper: 'drawer-container' }}
      >
        <div className="flex flex-col gap-10">
          <h3 className="flex justify-between items-center p-10 bg-white mb-5 mt-0 border-b">
            Redemption Catalog
            <IconButton onClick={() => setDrawerOpen(false)} color="primary">
              <CloseIcon />
            </IconButton>
          </h3>

          <div className="flex flex-col">
            <div className="flex justify-center items-center w-full p-10">
              <div className="flex gap-2">
                {memberPoints.map((point) => (
                  <Chip
                    key={point.key}
                    label={`${point.key}: ${point.value.toLocaleString()}`}
                    onClick={() => handlePurseSelection(point)}
                    color={selectedPointPurse.key === point.key ? "primary" : "default"}
                    className={selectedPointPurse.key === point.key ? "disable-click" : ""}
                  />
                ))}
              </div>
            </div>

            <div className="p-20 m-0 flex flex-row flex-wrap gap-10">
              {availableVouchersWithPurse.map((voucher, index) => (
                <div key={index} className="flex-[0_0_30%]">
                  <Card className="box-shadow-none border-gray bg-white">
                    <CardContent className="flex flex-col">
                      <div className="flex items-center gap-2.5 h-35">
                        <div className="w-50 img-sec">
                          <img src="assets/bclc-logo.png" alt="Logo" />
                        </div>
                        <div className="flex justify-between w-full">
                          <div className="flex flex-col gap-2.5 flex-[77%]">
                            <h3 className="mt-2.5 card-text-ellipsis">{voucher.name}</h3>
                            {voucher.expirationDate && (
                              <small className="text-gray-500">
                                Expires {formatExpiryDate(voucher.expirationDate)}
                              </small>
                            )}
                            {voucher.cost && (
                              <small className="text-gray-500">
                                {voucher.cost.toLocaleString()} Points
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                      {voucher.cost && (
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          disabled={!isPointSourceValid(voucher.name, voucher.cost)}
                          onClick={() => {
                            setDrawerOpen(false);
                            buyVoucher(voucher.name);
                          }}
                        >
                          Buy with Points
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Drawer>

      <div className="flex flex-col gap-10 mt-5">
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Rewards Wallet</h1>

              <div className="flex items-center gap-4">

                {memberPoints.map(point => (
                  <div className="rounded-md px-4 py-2 shadow-sm rewards-wallets-points">
                    <span className="text-gray-600">{point.key}: </span>
                    <span className="font-bold">{point.value.toLocaleString()}</span>
                  </div>
                ))}

                <button className="bg-[#ff8201] text-white px-4 py-2 rounded-md font-medium hover:bg-[#ff8201] transition-colors"
                  disabled={!availableVouchers.length}
                  onClick={() => setDrawerOpen(true)}>
                  Buy with Points
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberVouchers.length > 0 ? (
                memberVouchers.map((voucher) => (
                  <div key={voucher.id} className="bg-white rounded-md shadow-md p-4 flex items-center">
                    <img
                      src="/assets/bclc-logo.png"
                      alt="BCLC Logo"
                      className="w-16 h-16 object-contain"
                    />

                    <div className="border-l border-dashed border-[#6c757d] mx-4 h-12"></div>

                    <div className="flex flex-col">
                      <h3 className="font-bold text-gray-900 mb-2">{voucher.name}</h3>
                      {voucher.expiresOn && (<span className="text-sm font-light text-[11px] color-[#6c757d]">Expires {checkExpiry(voucher.expiresOn)}</span>)}
                    </div>
                  </div>
                ))
              ) : (
                <NoData>No reward available in the wallet.</NoData>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};