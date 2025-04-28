import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, LinearProgress } from '@mui/material';
import { RefreshCw, BadgeCheck, Mail, CalendarDays, Diamond } from 'lucide-react';
import { useActivityService } from '@/hooks/useActivityService';
import { useMemberService } from '@/hooks/useMemberService';
import { addMember } from '@/redux/slices/memberSlice';
import useAlertService from '@/hooks/useAlertService';
import { cn } from '@/utils/cnIndex';
import { StreaksCategory } from '@/types';
import { useNavigate } from 'react-router-dom';
import { CouponEnum } from '@/enums/coupon-enum';
import { WidgetHelper } from '@/types/Widget';
import './dashboardStyles.css';
import { AppTimer } from '../AppTimer';
import { Refresh } from '@mui/icons-material';
import { MdHotel, MdCake, MdRestaurant, MdCardGiftcard, MdLocalOffer, MdBadge, MdEmail, MdCalendarToday, MdDiamond } from "react-icons/md";
import { formatDateLocalString } from '@/utils/formatters';
import { Loader } from '../loader/Loader';
export const Dashboard: React.FC = () => {
  const [widgetData, setWidgetData] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<any[]>([]);
  const [isWidgetSkeleton, setIsWidgetSkeleton] = useState(true);
  const [streakSkeleton, setStreakSkeleton] = useState(true);
  const [tierSkeleton, setTierSkeleton] = useState(true);
  const [selectedStreakCategory, setSelectedStreakCategory] = useState(StreaksCategory.ACTIVE);
  const [providerPoints, setProviderPoints] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [streakInfo, setStreakInfo] = useState<any>(null);
  const [streakViewProgressSelections, setStreakViewProgressSelections] = useState({
    previousTab: StreaksCategory.ACTIVE,
    viewProgressSelections: []
  });

  const memberInfo = useSelector((state: any) => state.member);
  const location = useSelector((state: any) => state.location.location);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activityService = useActivityService();
  const memberService = useMemberService();
  const alertService = useAlertService();

  const tierBenefitsIcons = [
    { thumbnail: 'hotel', icon: MdHotel },
    { thumbnail: 'cake', icon: MdCake },
    { thumbnail: 'restaurant', icon: MdRestaurant },
    { thumbnail: 'card_giftcard', icon: MdCardGiftcard },
    { thumbnail: 'local_offer', icon: MdLocalOffer },
  ];


  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const loyaltyId = localStorage.getItem('loyaltyId') || '1001';
        const member = await memberService.getMember(loyaltyId);
        dispatch(addMember({ member }));
        localStorage.setItem('loyaltyId', member.loyaltyId);
      } catch (error: any) {
        alertService.errorAlert(error?.error?.error || error?.message);
      }
    };

    initializeDashboard();
  }, []);

  useEffect(() => {
    if (memberInfo?._id) {
      setIsWidgetSkeleton(true);
      setTierSkeleton(true);
      getPurseValues();
      getWidgetData();
      getStreakInfo();
    }
  }, [memberInfo]);

  useEffect(() => {
    if (location) {
      getStreakInfo();
    }
  }, [location]);

  const getPurseValues = () => {
    if (memberInfo) {
      setProviderPoints(
        memberInfo.purses
          .filter((purse: any) => !purse.name.includes('Status'))
          .map((purse: any) => ({
            provider: purse.name,
            balance: purse.availBalance
          }))
      );
    }
  };

  const getWidgetData = async () => {
    try {
      const requests = Object.values(CouponEnum).map(val =>
        activityService.getActivity(getActivityPayload(val))
      );
      const widgets = await Promise.all(requests);
      setWidgetData(widgets.map(widget => WidgetHelper.createWidget(widget)));
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
      setWidgetData(Object.values(CouponEnum).map(() => WidgetHelper.createWidget({})));
    } finally {
      setIsWidgetSkeleton(false);
      setTierSkeleton(false);
    }
  };

  const getStreakInfo = async (isRefresh: boolean = false) => {
    setStreakSkeleton(true);
    try {
      const res: any = await activityService.getStreakPolicy();
      setStreakInfo(res);
      setSteps(
        res.map((data: any) => ({
          ...data,
          icon: 'pending',
          status: 'pending',
          timeRemaining: (data.timeLimit ?? 0) / 1440,
          rewards: data?.ext?.rewards ?? [],
          goals: data?.goalPolicies ?? []
        }))
      );
      await fetchStreaks(isRefresh);
      setStreakSkeleton(false);
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
      setStreakSkeleton(false);
    }
  };

  const fetchStreaks = async (isRefresh: boolean = false) => {
    try {
      await getStreaksPR('Streak Progress', isRefresh);
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    }
  };

  const getStreaksPR = async (code: string, isRefresh: boolean = false) => {
    setStreakSkeleton(true);
    try {
      const payload = {
        type: "Personalization",
        srcChannelType: "Web",
        srcChannelID: location.location,
        loyaltyID: memberInfo?.loyaltyId,
        couponCode: code,
        date: new Date().toISOString()
      };

      const res: any = await activityService.getActivity(payload);

      if (res.data?.streaksProgress?.length) {
        const updatedSteps = res.data.streaksProgress.map((sp: any) => ({
          ...sp.streak,
          goalCompleted: `${sp.goals.filter((a: any) => a.status === 'Complete').length}/${sp.streak.noOfGoals}`,
          icon: getStatusIconName(sp.streak.status),
          goals: sp.goals,
          rewards: sp.streak.rewards ?? (sp.goals.length ? sp.goals.flatMap((a: any) => a.rewards) : []),
          streakId: sp.streakId
        }));

        setSteps(updatedSteps);

        if (!isRefresh) {
          selectStreakCategory(StreaksCategory.ACTIVE, updatedSteps);
        } else {
          prepopulateStreakPrevInfo();
        }
      }
      else {
        selectStreakCategory(StreaksCategory.ACTIVE, []);
      }
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    } finally {
      setStreakSkeleton(false);
    }
  };

  const prepopulateStreakPrevInfo = () => {
    setSelectedStreakCategory(streakViewProgressSelections.previousTab);
    selectStreakCategory(streakViewProgressSelections.previousTab);
    if (streakViewProgressSelections.viewProgressSelections.length) {
      streakViewProgressSelections.viewProgressSelections.forEach((streakId: string) => {
        const streak = streaks.find((s) => s.streakId === streakId);
        if (streak) {
          setStreaks(
            streaks.map((s) =>
              s.streakId === streakId ? { ...s, displayProgress: true } : s
            )
          );
        }
      });
    }
  };

  const getStatusIconName = (status: string): string => {
    switch (status) {
      case 'Complete': return 'check_circle';
      case 'Active': return 'check';
      case 'Expired': return 'warning';
      default: return 'pending';
    }
  };

  const selectStreakCategory = (category: StreaksCategory, streakSteps: any = '') => {
    setSelectedStreakCategory(category);
    setStreakViewProgressSelections(prev => ({
      ...prev,
      previousTab: category
    }));

    const allStreakSteps = streakSteps ? streakSteps : steps;
    const filteredStreaks = allStreakSteps.filter((data: any) => {
      if (category === StreaksCategory.Ended) {
        return data.status === 'Complete' || data.status === 'Expired';
      } else if (category === StreaksCategory.ACTIVE) {
        return data.status === 'Active';
      }
      return true;
    });

    setStreaks(filteredStreaks);
  };

  const getActivityPayload = (coupon: string) => ({
    type: coupon === 'Streak Progress' ? 'Streak Progress' : 'Personalization',
    date: new Date().toISOString(),
    srcChannelType: 'Web',
    couponCode: coupon === 'Streak Progress' ? memberInfo?.streaks[0]?._id : coupon,
    srcChannelID: 'Corporate',
    loyaltyID: memberInfo?.loyaltyId
  });

  const streakOptinPR = async () => {
    setStreakSkeleton(true);
    try {
      const payload = {
        type: "Streak Optin",
        srcChannelType: "Web",
        srcChannelID: location.location,
        loyaltyID: memberInfo?.loyaltyId,
        couponCode: "Double Play Challenge",
        date: new Date().toISOString()
      };

      await activityService.getActivity(payload);
      await fetchStreaks();
      setStreakSkeleton(false);
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    } finally {
      setStreakSkeleton(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] py-6">
      <div className="max-w-[1300px] mx-auto px-4">
        {/* First Row */}
        <div className="grid grid-cols-4 gap-5 mb-5" key="dashboard-page">
          {/* Welcome Back Card */}
          <Card className="p-5 rounded-xl shadow-sm min-h-[300px]">
            {isWidgetSkeleton && <Loader loaderType="shimmerSkeleton"></Loader>}
            {!isWidgetSkeleton && <div className="space-y-6">
              <div>
                <h3 className="text-[#667085] text-sm font-normal mb-1">Welcome back,</h3>
                <h2 className="text-[#1D2939] text-xl font-semibold">
                  {memberInfo?.firstName} {memberInfo?.lastName}
                </h2>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 rounded-full bg-[#FFF7ED] flex items-center justify-center">
                    <MdBadge className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-[#667085]">Loyalty ID</div>
                    <div className="text-sm text-[#1D2939] font-semibold">{memberInfo?.loyaltyId}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 rounded-full bg-[#FFF7ED] flex items-center justify-center">
                    <MdEmail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-[#667085]">Email</div>
                    <div className="text-sm text-[#1D2939] font-semibold">{memberInfo?.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFF7ED] flex items-center justify-center">
                    <MdCalendarToday className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-[#667085]">Member Since</div>
                    <div className="text-sm text-[#1D2939] font-semibold">
                      {formatDateLocalString(memberInfo?.enrollDate || '')}
                    </div>
                  </div>
                </div>
              </div>
            </div>}
          </Card>

          {isWidgetSkeleton && [1, 2].map((n, i) => (
            <Card className="p-5 rounded-xl shadow-sm" key={i}>
              <Loader loaderType="shimmerSkeleton"></Loader>
            </Card>
          ))}

          {!isWidgetSkeleton && widgetData.map((widget, index) => (
            index < 2 && (
              <Card className="p-5 rounded-xl shadow-sm" key={index}>
                <h3 className="text-[#1D2939] text-base font-medium mb-4">{index === 0 ? 'Encore Tier Status' : 'GCGC Tier Status'}</h3>
                <div>
                  <div className={`text-white rounded-lg p-4 text-center mb-4 tier-badge ${index === 0 ? 'encore' : 'ruby'}`}>
                    <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                      <MdDiamond className="w-7 h-7" />
                      {/* <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" className="w-5 h-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12.16 3h-.32L9.21 8.25h5.58zM16.46 8.25h5.16L19 3h-5.16zM21.38 9.75h-8.63V20.1zM11.25 20.1V9.75H2.62zM7.54 8.25 10.16 3H5L2.38 8.25z"></path></svg> */}
                    </div>
                    <h2 className="text-lg font-semibold">{widget.currentTier}</h2>
                  </div>
                  <div className="tier-progress">
                    {widget.nextTier !== widget.currentTier ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="progress-label">Progress to {widget.nextTier}</span>
                            <span className="progress-percentage text-xs font-semibold text-gray-900">{((widget.totalSpends / widget.nextMilestone) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 color-[#77B900] rounded-full overflow-hidden">
                            {/* <div className={`h-full w-[65%] bg-[#77B900] rounded-full w-[${((widget.totalSpends / widget.nextMilestone) * 100).toFixed(0)}%]`} /> */}
                            <LinearProgress
                              variant="determinate"
                              value={(widget.totalSpends / widget.nextMilestone) * 100}
                              className="tier-progress-bar"
                            />
                          </div>
                          <div className="flex justify-between text-sm text-[#667085] progress-stats">
                            <span className="text-xs font-semibold text-gray-900">
                              {widget.totalSpends.toLocaleString()} points
                            </span>
                            <span className="points-needed text-xs font-normal">
                              {(widget.nextMilestone - widget.totalSpends).toLocaleString()} to next tier
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <span className="color-green text-center winning-text">
                        Congratulations! You have achieved the Top Tier
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )
          ))}

          {/* Points Balance Card */}
          <Card className="p-5 card-style flex-[25%]">
            {isWidgetSkeleton && <Loader loaderType="shimmerSkeleton"></Loader>}
            {!isWidgetSkeleton && <div className="points-balance-section">
              <h3 className="section-title">Points Balance</h3>
              <div className="balance-cards">
                <div className="provider-points">
                  {providerPoints.map((provider, index) => (
                    <div key={provider.provider} className="provider-item">
                      <div className="provider-name">{provider.provider}</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {!isNaN(provider.balance)? Math.round(provider.balance).toLocaleString():'-'} Points
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>}
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-2 gap-5">
          {/* Tier Benefits */}

          <Card className="p-5 rounded-xl shadow-sm">
            {tierSkeleton && <Loader loaderType="cardLoader"></Loader>}
            {!tierSkeleton && <div>
              {/* <h3 className="text-[#1D2939] text-base font-medium mb-4">Tier Benefits</h3> */}
              <h1 className="text-base font-semibold text-gray-900 mb-4">Tier Benefits</h1>
              <div className="grid grid-cols-2 gap-4">
                {widgetData[2]?.tierBenefits.map((benefit: any, index: number) => (
                  <div key={index} className="bg-[#f3f3f3] rounded-lg px-4 py-6">
                    <div className="flex flex-col gap-3">
                      <div className="w-full rounded-full flex flex-row items-center">
                        {/* <span className="material-icons text-primary">{benefit.thumbnail}</span> */}
                        {tierBenefitsIcons.filter(e => e.thumbnail === benefit.thumbnail).map(({ icon: Icon }) => (
                          <div className="flex flex-row">
                            <Icon className="w-[22px] h-[22px] mb-1 text-primary" />
                            <h4 className="text-md text-[#000000] ml-2 mb-1 font-semibold">{benefit.title}</h4>
                          </div> 
                        ))}
                        
                      </div>
                      <div>                        
                        <p className="text-sm text-[#000000]">{benefit.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>}
          </Card>

          <Card className="px-5 py-4 rounded-xl shadow-sm">
            {/* Encore Rewards Challenges */}

            {streakSkeleton && <Loader loaderType="wideBanner"></Loader>}

            {!streakSkeleton && <div className="flex flex-col bg-white flex-[50%]">
              <div className="challenge-header">
                <div className="challenge-title flex flex-row items-center ">
                  {/* <h3 className="m-0">Encore Rewards Challenges</h3> */}
                  <h1 className="text-base font-semibold text-gray-900">Encore Rewards Challenges</h1>
                  <button
                    className="refresh-button text-base"
                    onClick={() => getStreakInfo(true)}
                  >
                    <Refresh />
                  </button>
                </div>
                <div className="challenge-filters">
                  {Object.values(StreaksCategory).filter(e => e != StreaksCategory.AVAILABLE).map((category) => (
                    <button
                      key={category}
                      className={`challenge-filter ${selectedStreakCategory === category ? 'active' : ''}`}
                      onClick={() => selectStreakCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {!streaks.length ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <p className="text-gray-500 text-center">
                    {selectedStreakCategory === StreaksCategory.ACTIVE ? (
                      <>
                        <p>You are currently not participating in any challenges</p>
                        <p>Join a challenge to start earning rewards!</p>
                      </>
                    ) : (
                      <p>You haven't completed any challenges yet</p>
                    )}
                  </p>
                  {selectedStreakCategory === StreaksCategory.ACTIVE && (
                    <button
                      className="mt-4 px-6 py-2 bg-primary text-white rounded-full"
                      onClick={streakOptinPR}
                    >
                      Get Started
                    </button>
                  )}
                </div>
              ) : (
                streaks.map((streak, index) => (
                  <div key={index} className="streak-card streak-card-box">
                    <div className="challenge-content">
                      <div className="challenge-progress">
                        <div className="challenge-name">
                          <h3 className="m-0 text-base font-semibold">{streak.name}</h3>
                          <span>🎪</span>
                        </div>

                        {streak.goals.map((goal: any, goalIndex: number) => (
                          <div key={goalIndex} className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-xs font-semibold text-gray-900">
                                {goal.name}: ${(goal.value || 0).toLocaleString()}/${goal.target.toLocaleString()}
                              </span>
                            </div>
                            <LinearProgress
                              variant="determinate"
                              value={(goal.value || 0) / goal.target * 100}
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="challenge-info">
                        <p className="text-xs leading-[1.8] text-[#718096]">{streak.desc}</p>

                        {streak.startedAt && streak.timeLimit && streak.status === 'Active' && (
                          <div className="challenge-timer">
                            <AppTimer
                              startedAt={streak.startedAt}
                              timeLimit={streak.timeLimit}
                            />
                          </div>
                        )}

                        <div className="status-cards">
                          <div className="status-card">
                            <div className="status-title">Status</div>
                            <div className="status-value">
                              <div className={`status-indicator ${streak.status.toLowerCase()}`}></div>
                              <span className="text-xs font-semibold">{streak.status}</span>
                            </div>
                          </div>
                          <div className="status-card">
                            <div className="status-title">Goals</div>
                            <div className="text-xs font-semibold">{streak.goalCompleted}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>}
          </Card>

        </div>
      </div>
    </div>
  );
};