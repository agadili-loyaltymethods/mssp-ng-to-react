import { Goals } from "./goals";
import { Policy } from "./policy";
import { Reward } from "./streak-policy";

export interface Streaks {
    startedAt: string;
    changedAt: string;
    status: string;
    value: number;
    currGoal: null,
    goals: Goals[],
    policyId: string | Policy;
    _id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    ext?: {
        startDate: string;
        endDate: string;
        rewards: Reward[];
    }
}