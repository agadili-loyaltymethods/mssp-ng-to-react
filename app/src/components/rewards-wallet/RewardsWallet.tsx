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
import CommonModalPopup from '../modals/common-modal-popup/CommonModalPopup';
import { Loader } from '../loader/Loader';

export const RewardsWallet: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isOpenRewardWallets, setIsOpenRewardWallets] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [availableVouchersWithPurse, setAvailableVouchersWithPurse] = useState<any[]>([]);
  const [memberVouchers, setMemberVouchers] = useState<any[]>([]);
  const [selectedPointPurse, setSelectedPointPurse] = useState<any>({});
  const [memberPoints, setMemberPoints] = useState<any[]>([]);

  const memberInfo = useSelector((state: any) => state.member);
  const location = useSelector((state: any) => state.location);
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

  useEffect(() => {
    handlePurseSelection(selectedPointPurse);
  }, [selectedPointPurse.key, availableVouchers]);

  const getRewardWallet = async () => {
    setIsLoading(true);
    try {
      const response: any = await activityService.getActivity(getPayload());
      const pointsData = response.data.rdBalances;
      const memberPointsData = Object.keys(pointsData).map(key => ({
        key,
        value: pointsData[key]
      }));
      setMemberPoints(memberPointsData);
      if (memberPointsData?.length) {
        setSelectedPointPurse(memberPointsData[0]);
      }
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

  return (
    <>
      {/* {isLoading && <Loader loaderType="cardSkeletonLoader"></Loader>} */}
      {isLoading && <Loader loaderType="skeltonCards"></Loader>}
      {!isLoading && <div className="flex flex-col gap-10 mt-5">
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-lg font-semibold text-gray-900">Rewards Wallet</h1>

              <div className="flex items-center gap-4">

                {memberPoints.map(point => (
                  <div className="rounded-md px-4 py-2 shadow-sm rewards-wallets-points">
                    <span className="text-gray-600">{point.key}: </span>
                    <span className="font-bold">{point.value.toLocaleString()}</span>
                  </div>
                ))}

                <button className="bg-[#ff8201] text-white px-4 py-2 rounded-md font-medium hover:bg-[#ff8201] transition-colors"
                  disabled={!availableVouchers.length}
                  onClick={() => setIsOpenRewardWallets(true)}>
                  Buy with Points
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberVouchers.length > 0 ? (
                memberVouchers.map((voucher) => (
                  <div key={voucher.id} className="bg-white rounded-md border border-solid border-[#dedede] p-6 flex items-center">
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
      </div>}

      <CommonModalPopup
        isOpen={isOpenRewardWallets}
        onClose={() => setIsOpenRewardWallets(false)}
        title="Redemption Catalog"
        width="w-[66%]"
        height="min-h-[500px] max-h-[500px] h-[500px]"
        classStyles="overflow-y-auto h-[85%]"
      >
        <div className="flex flex-col">
          <div className="flex justify-center items-center w-full p-2">
            <div className="flex gap-2">
              {memberPoints.map((point) => (
                <Chip
                  key={point.key}
                  label={`${point.key}: ${point.value.toLocaleString()}`}
                  onClick={() => handlePurseSelection(point)}
                  // color={selectedPointPurse.key === point.key ? "primary" : "default"}
                  className={selectedPointPurse.key === point.key ? "bg-primary-orange" : ""}
                //className="focus:bg-primary focus:text-white active:bg-primary focus:text-white hover:bg-primary hover:text-white"
                />
              ))}
            </div>
          </div>
          <div className="px-1 py-8 m-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
            {availableVouchersWithPurse.map((voucher, index) => (
              <div key={index} className="flex-[0_0_30%]">
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div> */}
                <Card className="box-shadow-none border-gray-light bg-white">
                  <CardContent className="flex flex-col">
                    <div className="p-2 flex items-center">
                      <img
                        src="/assets/bclc-logo.png"
                        alt="BCLC Logo"
                        className="w-16 h-16 object-contain"
                      />

                      <div className="border-l border-dashed border-[#6c757d] mx-4 h-12"></div>

                      <div className="flex flex-col">
                        <h2 className="mt-2.5 card-text-ellipsis font-bold">{voucher.name}</h2>
                        {voucher.expiresOn && (
                          <small className="mt-2 text-gray-500">
                            Expires {checkExpiry(voucher.expiresOn)}
                          </small>
                        )}
                        {voucher.cost && (
                          <small className="mt-2 text-gray-500">
                            {voucher.cost.toLocaleString()} Points
                          </small>
                        )}
                      </div>
                    </div>
                    <div className="p-2 flex items-center">
                      {voucher.cost && (
                        <Button
                          variant="contained"
                          color="primary"
                          className={!isPointSourceValid(voucher.name, voucher.cost) ? '' : `bg-primary-orange`}
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
                    </div>

                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </CommonModalPopup>
    </>
  );
};