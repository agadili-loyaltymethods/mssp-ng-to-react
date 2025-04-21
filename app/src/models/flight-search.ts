import { CurrencyCode } from "../enums/currency-code";

export interface FlightSearch {
    depart: string;
    arrive: string;
    departTime: string;
    returnTime: string;
    tripType: string;
    currencyCode: CurrencyCode;
}