import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import { addMember } from '../../redux/slices/memberSlice';
import { RootState } from '../../redux/store';
import { MemberInfo } from './components/MemberInfo';
import { TierStatus } from './components/TierStatus';
import { PointsBalance } from './components/PointsBalance';
import { TierBenefits } from './components/TierBenefits';
import { RewardsChallenges } from './components/RewardsChallenges';
import useAlertService from '@/hooks/useAlertService';
import { useMemberService } from '@/hooks/useMemberService';
import { useAuthService } from '@/hooks/useAuthService';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated$ } = useAuthService();
  const { getMember } = useMemberService();
  const { errorAlert } = useAlertService();
  const [isLoading, setIsLoading] = useState(true);
  const [widgetData, setWidgetData] = useState<any[]>([]);
  const [widgetSkeleton, setWidgetSkeleton] = useState(true);
  const [streakSkeleton, setStreakSkeleton] = useState(true);
  const [providerPoints, setProviderPoints] = useState<any[]>([]);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const loyaltyId = localStorage.getItem('loyaltyId') || '1001';
        const member = await getMember(loyaltyId);
        dispatch(addMember({ member }));
        localStorage.setItem('loyaltyId', member.loyaltyId);
      } catch (error: any) {
        errorAlert(error?.error?.error || error?.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated$) {
      fetchMember();
    } else {
      setIsLoading(false);
    }
  }, [dispatch, getMember, isAuthenticated$, errorAlert]);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        className="c-loader"
      >
        <div className="lds-roller">
          <div></div><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div>
        </div>
      </Box>
    );
  }

  return (
    <>
      {isAuthenticated$ && (
        <div className="flex flex-row justify-center items-center">
          <div className="flex flex-row w-1300 p-20">
            <div className="flex-1 flex flex-row gap-20">
              <div className="flex flex-col gap-20 items-stretch flex-1">
                {!widgetSkeleton && (
                  <div className="flex flex-row gap-20">
                    <MemberInfo />
                    {widgetData.map((widget, index) => (
                      index < 2 && <TierStatus key={index} widget={widget} index={index} />
                    ))}
                    <PointsBalance providerPoints={providerPoints} />
                  </div>
                )}

                <div className="flex-1 flex flex-row gap-20">
                  <TierBenefits 
                    widgetSkeleton={widgetSkeleton} 
                    widgetData={widgetData} 
                  />
                  <RewardsChallenges 
                    streakSkeleton={streakSkeleton}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;