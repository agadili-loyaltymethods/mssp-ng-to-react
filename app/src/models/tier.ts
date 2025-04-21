import { Level } from "./level";

export interface Tier{
    "name": string;
    "level": Level,
    "achievedOn": string;
    "requalsOn": string;
    "primary": boolean;
    "policyId": string;
    "program": string;
    "prevLevelName": string,
    "_id": string;
    "createdAt": string;
    "updatedAt": string;
    "createdBy": string;
    "updatedBy": string;
}