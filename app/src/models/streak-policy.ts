export interface StreakPolicy extends Streak{
    goals: Streak[];
}

export interface Streak {
    _id: string;
    streakId: string;
    name: string;
    description: string;
    desc: string;
    icon: string;
    status: string;
    timeLimit: number;
    rewards: Reward[];
    completedOn?: string;
    awarded?: Reward[];
    displayProgress: boolean;
    endedAt: string;
    value:number;
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
        rewards: Reward[];
    }
    goals: Streak[];
}

export interface Reward {
    icon: string;
    name: string;
    earn: boolean;
}

export interface ExpiresIn {
    icon: string;
    msg: string;
}