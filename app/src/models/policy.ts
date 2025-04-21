import { GoalPolicies } from "./goal-policies";

export interface Policy {
    name: string;
    ruleTemplate: string;
    description: string;
    effectiveDate: string;
    expirationDate: string;
    timeLimit: number;
    coolOffTime: number;
    instanceLimit: number;
    optinRule: string;
    accRule: string;
    evalRule: string;
    bonusRule: string;
    memLevelOverride: boolean;
    goalPolicies: GoalPolicies[];
    program: string;
    org: string;
    optinSegments: [];
    precision: number;
    numGoalsNeeded: number;
    version: number;
    status: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}