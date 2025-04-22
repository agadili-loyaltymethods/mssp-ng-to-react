import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, IconButton, Chip, LinearProgress } from '@mui/material';
import { useActivityService } from '@/hooks/useActivityService';
import { useMemberService } from '@/hooks/useMemberService';
import { addMember } from '@/redux/slices/memberSlice';
import { AppTimer } from '@/components/app-timer/AppTimer';
import { StreaksCategory } from '@/enums/streaks-category';
import { Reward } from '@/enums/reward';
import { CouponEnum } from '@/enums/coupon-enum';
import { ColorScheme } from '@/constants/color-scheme';
import { Member } from '@/types';
import useAlertService from '@/hooks/useAlertService';
import { WidgetHelper } from '@/types/Widget';
import './dashboard.css';

export const Dashboard: React.FC = () => {
  const [widgetData, setWidgetData] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<any[]>([]);
  const [widgetSkeleton, setWidgetSkeleton] = useState(true);
  const [streakSkeleton, setStreakSkeleton] = useState(true);
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
      setWidgetSkeleton(true);
      setStreakSkeleton(true);
      getPurseValues();
      getWidgetData();
      getStreakInfo();
    }
  }, [memberInfo]);

  useEffect(() => {
    if (location?.location) {
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
      setWidgetSkeleton(false);
    }
  };

  const getStreakInfo = async (isRefresh: boolean = false) => {
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
      fetchStreaks(isRefresh);
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
          selectStreakCategory(StreaksCategory.ACTIVE);
        } else {
          prepopulateStreakPrevInfo();
        }
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

  const selectStreakCategory = (category: StreaksCategory) => {
    setSelectedStreakCategory(category);
    setStreakViewProgressSelections(prev => ({
      ...prev,
      previousTab: category
    }));

    const filteredStreaks = steps.filter((data: any) => {
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
      fetchStreaks();
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    } finally {
      setStreakSkeleton(false);
    }
  };

  return (
    <div className="flex flex-row justify-center items-center">
      <div className="flex flex-row w-[1300px] p-20">
        <div className="flex-1 flex flex-row gap-20">
          <div className="flex flex-col gap-20 items-stretch flex-1">
            {!widgetSkeleton && (
              <div className="flex flex-row gap-20">
                {/* Member Widget */}
                <Card className="p-20 card-style flex-[25%]">
                  <div className="welcome-section">
                    <div className="user-header">
                      <div className="user-welcome">
                        <h2 className="welcome-text">Welcome back,</h2>
                        <h1 className="user-name">{memberInfo?.firstName} {memberInfo?.lastName}</h1>
                      </div>
                    </div>
                    <div className="user-details">
                      <div className="detail-item flex flex-row items-center">
                        <span className="material-icons">badge</span>
                        <span>
                          <small className="label">Loyalty ID</small>
                          <div className="value">{memberInfo?.loyaltyId}</div>
                        </span>
                      </div>
                      <div className="detail-item flex flex-row items-center">
                        <span className="material-icons">email</span>
                        <span>
                          <small className="label">Email</small>
                          <div className="value">{memberInfo?.email || '-'}</div>
                        </span>
                      </div>
                      <div className="detail-item flex flex-row items-center">
                        <span className="material-icons">calendar_today</span>
                        <span>
                          <small className="label">Member Since</small>
                          <div className="value">
                            {new Date(memberInfo?.enrollDate).toLocaleDateString()}
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Tier Status Cards */}
                {widgetData.map((widget, index) => (
                  index < 2 && (
                    <Card key={index} className="p-20 card-style flex-[25%]">
                      <div className="tier-status-section">
                        <h3 className="section-title">
                          {index === 0 ? 'Encore Tier Status' : 'GCGC Tier Status'}
                        </h3>
                        <div className="tier-card">
                          <div className={`tier-badge ${index === 0 ? 'encore' : 'ruby'}`}>
                            <div className="tier-icon-wrapper">
                              <span className="material-icons tier-icon">diamond</span>
                            </div>
                            <h2>{widget.currentTier}</h2>
                          </div>
                          <div className="tier-progress">
                            {widget.nextTier !== widget.currentTier ? (
                              <>
                                <div className="flex flex-row justify-between items-center">
                                  <span className="progress-label">Progress to {widget.nextTier}</span>
                                  <span className="progress-percentage">
                                    {((widget.totalSpends / widget.nextMilestone) * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <LinearProgress
                                  variant="determinate"
                                  value={(widget.totalSpends / widget.nextMilestone) * 100}
                                  className="tier-progress-bar"
                                />
                                <div className="progress-stats">
                                  <span className="current-points">
                                    {widget.totalSpends.toLocaleString()} points
                                  </span>
                                  <span className="points-needed">
                                    {(widget.nextMilestone - widget.totalSpends).toLocaleString()} to next tier
                                  </span>
                                </div>
                              </>
                            ) : (
                              <span className="color-green text-center winning-text">
                                Congratulations! You have achieved the Top Tier
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                ))}

                {/* Points Balance Card */}
                <Card className="p-20 card-style flex-[25%]">
                  <div className="points-balance-section">
                    <h3 className="section-title">Points Balance</h3>
                    <div className="balance-cards">
                      <div className="provider-points">
                        {providerPoints.map((provider) => (
                          <div key={provider.provider} className="provider-item">
                            <div className="provider-name">{provider.provider}</div>
                            <div className="provider-value">
                              {provider.balance.toLocaleString()} Points
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Tier Benefits and Rewards Challenges */}
            <div className="flex-1 flex flex-row gap-20">
              {/* Tier Benefits */}
              <div className="flex flex-col card-style bg-white p-20 flex-[50%]">
                {!widgetSkeleton ? (
                  <>
                    <h3 className="mt-10 mb-20">Tier Benefits</h3>
                    <div className="flex flex-row flex-wrap gap-5">
                      {widgetData[2]?.tierBenefits?.map((benefit: any, index: number) => (
                        <div key={index} className="flex-[50%] items-stretch benefit-list">
                          <Card className="card-style benefit-card p-10 h-full">
                            <div className="flex flex-col gap-0 flex-1 p-0">
                              <div className="flex flex-row items-start perk-header gap-2.5">
                                <div className="benefit-thumbnail flex items-center justify-center">
                                  <span className="material-icons text-primary">
                                    {benefit.thumbnail}
                                  </span>
                                </div>
                                <div className="flex flex-col justify-center items-start flex-1 perk-card">
                                  <h3 className="color-accent title">{benefit.title}</h3>
                                </div>
                              </div>
                              <div className="flex-1 desc-container">
                                {benefit.desc.length === 1 ? (
                                  <div className="mb-2 mt-4">{benefit.desc[0]}</div>
                                ) : (
                                  <ul className="pl-20 mb-2 mt-4">
                                    {benefit.desc.map((desc: string, i: number) => (
                                      <li key={i}><span>{desc}</span></li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  // Skeleton loader for benefits
                  Array.from({ length: 2 }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex flex-row gap-10">
                      {Array.from({ length: 3 }).map((_, colIndex) => (
                        <Card key={colIndex} className="p-5 flex-[50%]">
                          <div className="skeleton">
                            <div className="skeleton-left">
                              <div className="line h-80 w-100p mb-10"></div>
                              <div className="line h-12 w-100p mb-10"></div>
                              <div className="line h-10 w-100p mb-5"></div>
                              <div className="line h-10 w-100p mb-5"></div>
                              <div className="line h-10 w-100p mb-5"></div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ))
                )}
              </div>

              {/* Rewards Challenges */}
              <div className="flex flex-col card-style bg-white p-20 flex-[50%]">
                {!streakSkeleton ? (
                  <>
                    <div className="flex flex-row justify-between items-center">
                      <div className="flex flex-row items-center">
                        <h3 className="mt-10 mb-20">Encore Rewards Challenges</h3>
                        <IconButton 
                          className="refresh-btn" 
                          onClick={() => getStreakInfo(true)}
                        >
                          <span className="material-icons">refresh</span>
                        </IconButton>
                      </div>
                      <div className="filter-container mb-20">
                        <small>
                          <div className="flex gap-2">
                            {Object.values(StreaksCategory).map((category) => (
                              <Chip
                                key={category}
                                label={category}
                                onClick={() => selectStreakCategory(category)}
                                color={selectedStreakCategory === category ? "primary" : "default"}
                                className={selectedStreakCategory === category ? "disable-click" : ""}
                              />
                            ))}
                          </div>
                        </small>
                      </div>
                    </div>

                    {!streaks.length ? (
                      <div className="flex flex-col items-center justify-center empty-challenges p-20">
                        <div className="text-center color-gray mb-20">
                          {selectedStreakCategory === StreaksCategory.ACTIVE ? (
                            <>
                              <p>You are currently not participating in any challenges</p>
                              <p>Join a challenge to start earning rewards!</p>
                            </>
                          ) : (
                            <p>You haven't completed any challenges yet</p>
                          )}
                        </div>

                        {selectedStreakCategory === StreaksCategory.ACTIVE && (
                          <button
                            className="get-started-btn"
                            onClick={streakOptinPR}
                          >
                            Get Started
                          </button>
                        )}
                      </div>
                    ) : (
                      streaks.map((step, index) => (
                        <div key={index} className="mb-20">
                          <div className="streak-card flex flex-row gap-24">
                            {/* Left side - Progress */}
                            <div className="flex-[60%] flex flex-col gap-16">
                              <div className="flex flex-row items-center gap-8 mb-10">
                                <h3 className="mat-title text-gray-900 font-bold">
                                  {step.name}
                                </h3>
                                <span className="text-xl">🎪</span>
                              </div>
                              
                              {!step.goals.length ? (
                                <div>{step.streakGoalMessage}</div>
                              ) : (
                                step.goals.map((goal: any, goalIndex: number) => (
                                  <div key={goalIndex} className="flex flex-col gap-6">
                                    <div className="flex flex-row items-center">
                                      <div className="flex flex-row items-center gap-8 mr-5">
                                        <span className="w-8 h-8 rounded-full bg-orange-500"></span>
                                      </div>
                                      <span className="font-medium text-gray-900 text-sm">
                                        <b>
                                          {goal.name}: {(goal.value || 0).toLocaleString()}/{goal.target.toLocaleString()}
                                        </b>
                                      </span>
                                    </div>
                                    <LinearProgress
                                      color="primary"
                                      variant="determinate"
                                      value={(goal.value || 0) / goal.target * 100}
                                      className="h-6"
                                    />
                                    <div className="flex flex-row justify-between items-center">
                                      {goal?.instantBonus && (
                                        <div className="flex flex-row justify-between start">
                                          <small>
                                            <b className="pr-4">Bonus earned so far: </b>
                                            {goal.instantBonus}
                                          </small>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Right side - Info */}
                            <div className="flex-[40%] flex flex-col gap-16">
                              <p className="text-gray-600 text-sm">{step.desc}</p>
                              {step.startedAt && step.timeLimit && step.status === 'Active' && (
                                <div className="bg-gray-500 text-white text-sm px-3 py-0.5 rounded-full inline-block width-fit-content">
                                  <AppTimer 
                                    startedAt={step.startedAt} 
                                    timeLimit={step.timeLimit}
                                  />
                                </div>
                              )}
                              <div className="flex flex-row gap-12">
                                <div className="flex-1 bg-gray-50 rounded-lg p-2 status-card flex flex-col gap-4">
                                  <div className="text-sm font-medium text-gray-500">Status</div>
                                  <div className="flex flex-row items-center gap-8">
                                    <span className={`w-8 h-8 rounded-full ${
                                      step.status === 'Complete' ? 'bg-green-500' :
                                      step.status === 'Active' ? 'bg-green' : 'bg-red'
                                    }`}></span>
                                    <span className="font-semibold text-gray-900">
                                      {step.status === 'Complete' ? 'Completed' : step.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-lg p-2 status-card flex flex-col gap-4">
                                  <div className="text-sm font-medium text-gray-500">Goals</div>
                                  <div className="font-semibold text-gray-900">{step.goalCompleted}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                ) : (
                  // Skeleton loader for challenges
                  <div className="flex flex-col gap-10">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="p-5 flex-[50%]">
                        <div className="skeleton">
                          <div className="skeleton-left">
                            <div className="line h-40 w-100p mb-10"></div>
                            <div className="line h-12 w-100p mb-10"></div>
                            <div className="line h-10 w-100p mb-5"></div>
                            <div className="line h-10 w-100p mb-5"></div>
                            <div className="line h-10 w-100p mb-5"></div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};