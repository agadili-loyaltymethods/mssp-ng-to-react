import { CampaignsObject } from "./campaigns-object";
import { Sweepstakes } from "./sweepstakes";

export interface Campaigns {
    campaignsObject: CampaignsObject[];
    sweepstakes: Sweepstakes[];
}