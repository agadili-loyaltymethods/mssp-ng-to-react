export interface Preference {
    memberId: string;
    name: string;
    value: string;
    type: string;
    inferred: boolean;
    expirationDate: string;
    optedInDate: string;
    org: string;
    category: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    partnerBonusMultiplier?: number;
}