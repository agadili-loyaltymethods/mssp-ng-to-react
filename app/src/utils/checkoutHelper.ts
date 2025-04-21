enum CcName {
    Visa = 'Visa',
    Mastercard = 'Mastercard',
    // Add other card types as needed
  }
  
  enum PaymentCards {
    Visa = 'Visa',
    Mastercard = 'Mastercard',
    // Add other card types as needed
  }
  
  interface CheckoutHelperOptions {
    TAX_SKU: string;
    DISCOUNT_SKU: string;
    HEMMING_SKU: string;
    HEMMING: string;
    SHIPPING_CATEGORY: string;
    TAX_CATEGORY: string;
    FREE_SHIPPING_SKU: string;
  }
  
  const checkoutHelperOptions: CheckoutHelperOptions = {
    TAX_SKU: 'Tax',
    DISCOUNT_SKU: 'Discount',
    HEMMING_SKU: 'Hemming Discount',
    HEMMING: 'Hemming',
    SHIPPING_CATEGORY: 'Shipping',
    TAX_CATEGORY: 'Tax',
    FREE_SHIPPING_SKU: 'Free Standard Shipping',
  };
  
  const createCancellationPayload = (items: any) => {
    return {
      type: 'Cancellation',
      date: new Date().toISOString(),
      couponCode: items?.result?.data?.activityId,
      value: items?.value,
    };
  };
  
  const createPayload = (
    total: number,
    lineItems: any,
    tenderItems: any,
    location: string,
    returnDate: string | null,
    additionalData: Partial<Record<string, any>> = {}
  ) => {
    return {
      date: returnDate ?? new Date(),
      value: parseFloat(total.toFixed(2)),
      srcChannelID: location,
      lineItems,
      tenderItems,
      bestOffers: [],
      ...additionalData,
    };
  };
  
  const createRepricePayload = (
    total: number,
    lineItems: any,
    tenderItems: any,
    location: string,
    returnDate: string | null
  ) => {
    return createPayload(total, lineItems, tenderItems, location, returnDate, {
      type: 'Reprice Ticket',
    });
  };
  
  const createAccrualPayload = (
    total: number,
    lineItems: any,
    tenderItems: any,
    location: string,
    bestOffers: any[] = [],
    returnDate: string | null
  ) => {
    return createPayload(total, lineItems, tenderItems, location, returnDate, {
      type: 'Accrual',
      bestOffers,
      currencyCode: 'USD',
    });
  };
  
  const createTenderItems = (type: keyof typeof PaymentCards, total: number) => {
    return [
      {
        type: PaymentCards[type],
        itemNo: 'a123',
        value: parseFloat(total.toFixed(2)),
        isVoid: false,
        ext: {
          ccType: CcName[type],
        },
      },
    ];
  };
  
  const createLineItems = (
    cartItems: any = [],
    discountLineItems: any[] = [],
    taxAmount: number,
    hemmingAmount = 0,
    shippingProduct: any = {}
  ): any[] => {
    const lineItems: any[] = [];
    hemmingAmount = Math.abs(hemmingAmount);
    const filteredCartItems = cartItems.filter(
      (item: any) =>
        item.category !== checkoutHelperOptions.SHIPPING_CATEGORY &&
        item.category !== checkoutHelperOptions.TAX_CATEGORY
    );
    const mapLineItems = (items: any[], type: string, baseIndex: number = 0) =>
      items.map((item: any, index: number) => ({
        itemPrice: item.cost || item.itemPrice,
        itemAmount: (item.cost || item.itemAmount) * (item.quantity ?? 1),
        itemSKU: item.sku || item.itemSKU,
        quantity: item.quantity ?? 1,
        lineNo: baseIndex + index + 1,
        isVoid: false,
        type: item.type || type,
        offerId: item.offerId,
      }));
    // Add cart items other than hemming
    lineItems.push(...mapLineItems(filteredCartItems, 'Normal'));
    // Add discount line items
    lineItems.push(...mapLineItems(discountLineItems, 'Discount', lineItems.length));
    // Add hemming discount line items
    const hemmingItems = [cartItems.find((item: any) => item.category === checkoutHelperOptions.HEMMING)].filter(
      Boolean
    ).map(() => ({
      itemPrice: hemmingAmount > 0 ? -hemmingAmount : 0,
      itemAmount: hemmingAmount > 0 ? -hemmingAmount : 0,
      itemSKU: checkoutHelperOptions.HEMMING_SKU,
      quantity: 1,
      type: checkoutHelperOptions.DISCOUNT_SKU,
    }));
    if (!cartItems.some((item: any) => item.sku === checkoutHelperOptions.HEMMING_SKU) && hemmingAmount) {
      lineItems.push(...mapLineItems(hemmingItems, 'Discount', lineItems.length));
    }
  
    // Add shipping product
    lineItems.push({
      itemPrice: shippingProduct.cost ?? 0,
      itemAmount: shippingProduct.cost ?? 0,
      itemSKU: shippingProduct.sku ?? checkoutHelperOptions.FREE_SHIPPING_SKU,
      quantity: 1,
      type: 'Normal',
      lineNo: lineItems.length + 1,
    });
    // Add tax
    lineItems.push({
      itemPrice: taxAmount,
      itemAmount: taxAmount,
      itemSKU: checkoutHelperOptions.TAX_SKU,
      quantity: 1,
      lineNo: lineItems.length + 1,
      isVoid: false,
      type: checkoutHelperOptions.TAX_SKU,
    });
    return lineItems;
  };
  
  const calculateTicketDiscount = (lineItems: any[] = []) => {
    const discountLineItem = lineItems.find(
      (lineItem: any) => lineItem.targetedItems?.includes(-1)
    );
    return Math.abs(discountLineItem?.itemPrice ?? 0);
  };
  
  const calculateSubtotal = (cartItems: any[] = [], returningItems: any[] = []) => {
    return cartItems
      .filter(
        (item: any) =>
          !returningItems.includes(item.sku) &&
          item.category !== checkoutHelperOptions.TAX_CATEGORY &&
          item.category !== checkoutHelperOptions.SHIPPING_CATEGORY &&
          item.sku !== checkoutHelperOptions.HEMMING_SKU
      )
      .reduce((total: number, item: any) => total + (item.cost ?? 0) * (item.quantity ?? 1), 0);
  };
  
  export {
    createCancellationPayload,
    createRepricePayload,
    createAccrualPayload,
    createTenderItems,
    createLineItems,
    calculateTicketDiscount,
    calculateSubtotal,
  };