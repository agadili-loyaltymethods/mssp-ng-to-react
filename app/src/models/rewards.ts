import { Reward } from "../enums/reward";

export interface Rewards {
    amount: number;
    type: string;
    expiryDate: string;
    category: Reward;
    imageUrl: string;
}