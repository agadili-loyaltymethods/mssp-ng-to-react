// Member types
export interface Member {
  enrollDate: string;
  enrollChannel: string;
  enrollSource: string;
  cellPhone: number;
  status: string;
  program: string;
  type: string;
  firstName: string;
  lastName: string;
  acquisitionDate: string;
  acquisitionChannel: string;
  email: string;
  canPreview: boolean;
  mergePendingFlag: boolean;
  unMergePendingFlag: boolean;
  synchronousMergeFlag: boolean;
  lastActivityDate: string;
  structureVersion: number;
  tiers: Tier[];
  badges: unknown[];
  purses: Purse[];
  streaks: any;
  org: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  loyaltyId: string;
  company: string;
  address: string;
  ext: {
    companyName: string;
    businessOrTrade: string;
  };
}

export interface Tier {
  name: string;
  level: Level;
  achievedOn: string;
  requalsOn: string;
  primary: boolean;
  policyId: string;
  program: string;
  prevLevelName: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Level {
  name: string;
  number: number;
  expiryWarningDays: string[];
  _id: string;
}

export interface Purse {
  name: string;
  balance: number;
  availBalance: number;
  accruedPoints: number;
  redeemedPoints: number;
  escrowsIn: number;
  primary: boolean;
  program: string;
  policyId: string;
  expiredPoints: number;
  org: string;
  lockedPoints: unknown[];
  _id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Activity types
export interface ActivityHistory {
  bestOffers: any[];
  date: string;
  utcOffset: string;
  type: string;
  srcChannelID: string;
  value: string;
  couponCode: string;
  currencyCode: string;
  lineItems: any[];
  _id: string;
  result: {
    desc?: string;
    errors: any[];
    data: {
      purses: ActivityPurses[];
      desc: string;
    };
    log: any[];
  };
  status: string;
  ext?: {
    bookingDt: string;
    destAirPort: string;
    flightNum: string;
    origAirport: string;
    pnr: string;
    tktNum: string;
    gaming?: any;
    lob?: string;
    folioId?: string;
  };
  location?: {
    name: string;
  };
}

export interface ActivityPurses {
  name: string;
  prev: number;
  new: number;
}

// Cart types
export interface CartItem {
  sku: string;
  name: string;
  desc: string;
  cost: number;
  quantity: number;
  category: string;
  url: string;
  ext?: {
    nonReturnable?: boolean;
    hideInMSSP?: boolean;
  };
}

export interface CartState {
  items: CartItem[];
}

// Location types
export interface Location {
  name: string;
  number: string;
  ext: {
    operator?: string;
    hideInMSSP?: boolean;
  };
}

// Coupon types
export interface Coupon {
  desc: string;
  ext: { 
    perkValue: number;
    rewardCost: number;
    purseName?: string;
  };
  name: string;
  _id: string;
  count?: number;
  cost?: number;
  url?: string;
  expiresOn?: string | Date;
  code?: string;
}

// Streak types
export interface StreakPolicy {
  _id: string;
  streakId: string;
  name: string;
  description: string;
  desc: string;
  icon: string;
  status: string;
  timeLimit: number;
  rewards: RewardModel[];
  completedOn?: string;
  awarded?: RewardModel[];
  displayProgress: boolean;
  endedAt: string;
  value: number;
  target: number;
  timeRemaining: number;
  startedAt: string;
  expiresIn: ExpiresIn;
  goalCompleted: string;
  streakGoalMessage: string;
  issuedInstantBonusCount: number;
  instantBonus: number;
  winnings: string;
  noOfGoals: number;
  ext?: {
    rewards: RewardModel[];
  };
  goals: StreakPolicy[];
}

export interface RewardModel {
  icon: string;
  name: string;
  earn: boolean;
}

export interface ExpiresIn {
  icon: string;
  msg: string;
}

// Segment types
export interface Segment {
  name: string;
  description: string;
  type: string;
  org: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  ext?: {
    marketing?: boolean;
    useCase?: string;
  };
}

// Widget types
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

// Checkout types
export interface LineItem {
  label: string;
  value: number;
  color?: string;
  size?: string;
  currency?: string;
}

// Enums
export enum PaymentCards {
  CREDIT_CARD = 'Credit Card',
  CASH = 'Cash',
}

export enum CcName {
  CREDIT_CARD = 'CC',
  CASH = 'Cash',
}

export enum LOB {
  FB = 'Food & Beverages Charges',
  HOTEL = 'Room Charges',
  SPA = 'Spa Charges'
}

export enum SpendCategory {
  NET_SPEND = 'Spend',
  POINTS = 'Points',
  ANY_WHERE_POINTS = 'Anywhere Points'
}

export enum ExternalCoupons {
  SWEEPSTAKES = 'YEAR_END_SWEEPSTAKES',
  QUIZ_WON = 'FASHION_QUIZ',
  SURVEY = 'SUMMER_SURVEY'
}

export enum Reward {
  REWARDS_WALLET = 'Rewards Wallet',
  EARNED_BENEFITS = 'Earned Benefits',
  EXCLUSIVE_OFFERS = 'Exclusive Offers',
  CAMPAIGNS = 'Clippable Coupons',
  SWEEPSTAKES = 'Sweepstakes',
  QUIZ = 'Quiz',
  SURVEY = 'Survey',
}

export enum StreaksCategory {
  AVAILABLE = 'All',
  ACTIVE = 'Active',
  Ended = 'Ended'
}

export enum PurchaseHistoryKeys{
  ACTIVITY_TYPE_ACCRUAL = 'Accrual',
  ACTIVITY_STATUS_PROCESSED = 'Processed',
  TAX_SKU = 'Tax',
  GRATUITY = 'Gratuity',
  DISCOUNT_SKU = 'Discount'
}
