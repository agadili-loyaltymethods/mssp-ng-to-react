export interface Widget {
  tierInfo: any;
  totalSpends: number;
  nextTier: string;
  currentTier: string;
  nextMilestone: number;
  aggregates: TierAggregates[];
  hemmingAvailable: number;
  streakBonus: number;
  pointBalance: number;
  tierBenefits: any;
}

export interface TierAggregates {
  label: string;
  value: string;
}

export class WidgetHelper {
  static createWidget(data: any): Widget {
    return {
      tierInfo: data?.data?.lineItems,
      totalSpends: data?.data?.tierProgress ? data.data.tierProgress.nonLinkedBal : 0,
      nextTier: data?.data?.tierProgress ? data.data.tierProgress.nextTier : '',
      currentTier: data?.data?.tierProgress ? data.data.tierProgress.currentTier : '',
      nextMilestone: data?.data?.tierProgress ? data.data.tierProgress.nextMilestone : 0,
      pointBalance: (data?.data?.pointBalance || data?.data?.pointsBalance) ?? 0,
      hemmingAvailable: data.data?.hemmingAvailable ?? 0,
      streakBonus: data?.data?.streakBonus ?? '',
      tierBenefits: data?.data?.tierBenefits ?? [],
      aggregates: data?.data?.aggregates ?? []
    };
  }
}
