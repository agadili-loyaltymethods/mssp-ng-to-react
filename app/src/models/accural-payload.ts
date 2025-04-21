export class AccuralPayload {
  type = 'Accrual';
  date = '';
  srcChannelType = 'Web';
  srcChannelID?: string;
  loyaltyID!: number;
  couponCode = '';
  partnerCode = '';
  value?: number;
  constructor(
    date: string,
    loyaltyId: string,
    coupon: string,
    partnerCode: string,
    srcChannelID?: string,
    value?: number
  ) {
    this.date = date;
    this.loyaltyID = +loyaltyId;
    this.couponCode = coupon;
    this.partnerCode = partnerCode;
    if (srcChannelID) {
      this.srcChannelID = srcChannelID;
    }
    if (value) {
      this.value = value;
    }
  }
}
