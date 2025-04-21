import { TierOffers } from "./tier-offers";

export interface TierInfo {
    label: string;
    value: string | TierOffers[];
}