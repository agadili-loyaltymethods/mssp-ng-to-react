export interface Purse{
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
    lockedPoints: unknown[],
    _id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}