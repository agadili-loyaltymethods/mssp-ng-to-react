import { ActivityPurses } from './activity-purses';

export interface ActivityHistory {
  bestOffers: [];
  date: string;
  utcOffset: string;
  type: string;
  srcChannelID: string;
  value: string;
  couponCode: string;
  currencyCode: string;
  lineItems: [];
  _id: string;
  result: {
    desc?: '';
    errors: [];
    data: {
      purses: ActivityPurses[];
      desc: string;
    };
    log: [];
  };
  status: string;
  ext?: {
    bookingDt: string;
    destAirPort: string;
    flightNum: string;
    origAirport: string;
    pnr: string;
    tktNum: string;
  };
}
