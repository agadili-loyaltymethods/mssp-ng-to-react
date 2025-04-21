import { Member } from "./member";

export interface MemberInfo {
    "accessToken": string;
    "idToken": string;
    "refreshToken": string;
    "member": Member;
}