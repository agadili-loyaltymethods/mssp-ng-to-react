export interface CouponList {
    activity: string;
    activityUTCOffset: number;
    canPreview: boolean;
    code: string;
    createdAt: string;
    createdBy: string;
    desc: string;
    effectiveDate: string;
    expiresOn: string;
    isCancelled: boolean;
    issueValue: number;
    member: string;
    mergeIds: [];
    name: string;
    org: string;
    policyId: string;
    redmValue: number;
    rule: string;
    type: string;
    upc: string;
    updatedAt: string;
    updatedBy: string;
    usesLeft: number;
    _id: string;
    redemptionDate?: string;
}