export interface Coupon {
    desc: string;
    ext: { perkValue: number, rewardCost: number },
    name: string;
    _id: string;
    count?: number;
}