import { Purse } from "./purse";
import { Tier } from "./tier";

export interface Member{
    "enrollDate": string;
    "enrollChannel": string;
    "enrollSource": string;
    "cellPhone": number;
    "status": string;
    "program": string;
    "type": string;
    "firstName": string;
    "lastName": string;
    "acquisitionDate": string;
    "acquisitionChannel": string;
    "email": string;
    "canPreview": boolean;
    "mergePendingFlag": boolean;
    "unMergePendingFlag": boolean;
    "synchronousMergeFlag": boolean;
    "lastActivityDate": string;
    "structureVersion": number,
    "tiers": Tier[];
    "badges": unknown[],
    "purses": Purse[];
    "streaks": any,
    "org": string;
    "_id": string;
    "createdAt": string;
    "updatedAt": string;
    "createdBy": string;
    "updatedBy": string;
    "loyaltyId": string;
    "company": string;
    "address": string;
    "ext": {
        companyName: string;
        businessOrTrade: string;
        
    }
}
