import { PaymentCards, CcName } from '../types';

export const createCancellationPayload = (items: any) => ({
  type: 'Cancellation',
  date: new Date().toISOString(),
  couponCode: items?.result?.data?.activityId,
  value: items?.value,
});

export const createTenderItems = (type: PaymentCards, total: number) => ([{
  type: PaymentCards[type],
  itemNo: 'a123',
  value: parseFloat(total.toFixed(2)),
  isVoid: false,
  ext: {
    ccType: CcName[type],
  },
}]);

export const calculateSubtotal = (cartItems: any[] = [], returningItems: any[] = []): number => {
  return cartItems
    .filter(item => 
      !returningItems.includes(item.sku) &&
      item.category !== 'Tax' &&
      item.category !== 'Shipping' &&
      item.sku !== 'Hemming Discount'
    )
    .reduce((total, item) => total + (item.cost ?? 0) * (item.quantity ?? 1), 0);
};
