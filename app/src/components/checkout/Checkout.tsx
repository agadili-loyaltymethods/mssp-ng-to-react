import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  LinearProgress,
  SelectChangeEvent,
  Chip,
  TextField,
  Button
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useActivityService } from '@/hooks/useActivityService';
import { useMemberService } from '@/hooks/useMemberService';
import { useProductService } from '@/hooks/useProductService';
import { PaymentCards } from '@/enums/cc-type';
import { formatCurrency } from '@/utils/formatters';
import { NoData } from '@/components/common/no-data/NoData';
import { LineItem } from '@/components/common/line-item/LineItems';
import { SectionHead } from '@/components/common/section-head/SectionHead';
import { addItem, clearCart, removeItem } from '@/redux/slices/cartSlice';
import useAlertService from '@/hooks/useAlertService';
import {
  calculateSubtotal,
calculateTicketDiscount,
createCancellationPayload,
createAccrualPayload,
createTenderItems,
createLineItems,
createRepricePayload
} from '@/utils/checkoutHelper';
import { CcName } from '@/types';

export const Checkout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentType, setPaymentType] = useState<any>('CREDIT_CARD');
  const [shippingType, setShippingType] = useState('');
  const [shippingProducts, setShippingProducts] = useState<any[]>([]);
  const [shippingList, setShippingList] = useState<string[]>([]);
  const [isReturn, setIsReturn] = useState(false);
  const [returningItems, setReturningItems] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [maxAllowedValue, setMaxAllowedValue] = useState(0);
  const [isHemmingAvailable, setIsHemmingAvailable] = useState(false);
  const [subTotal, setSubTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [tax, setTax] = useState(0);
  const [earnSummary, setEarnSummary] = useState<any>({});
  const [bestOffers, setBestOffers] = useState<any[]>([]);
  const [discountLineItems, setDiscountLineItems] = useState<any[]>([]);
  const [returnOrderHistory, setReturnOrderHistory] = useState<any>(null);
  const [returnDate, setReturnDate] = useState<string | null>(null);

  const memberInfo = useSelector((state: any) => state.member);
  const location = useSelector((state: any) => state.location.location);
  const cartState = useSelector((state: any) => state.cart);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activityService = useActivityService();
  const memberService = useMemberService();
  const productService = useProductService();
  const alertService = useAlertService();

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        const [taxProducts, shippingProds] = await Promise.all([
          productService.getOtherProducts('Tax', ''),
          productService.getOtherProducts('Shipping', 'Discount')
        ]);

        setTax(taxProducts.find((product: any) => product.sku === 'Tax')?.cost ?? 0);
        setShippingProducts(shippingProds);
        setShippingList(shippingProds.map((product: any) => product.name));
        setShippingType(shippingProds[0]?.name || '');
      } catch (error: any) {
        alertService.errorAlert(error?.error?.error || error?.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCheckout();
  }, []);

  useEffect(() => {
    if (cartState) {
      setCartItems(cartState.items);
      setIsHemmingAvailable(cartState.items.some((item: any) => item.category === 'Hemming'));
      
      if (isReturn) {
        const history = cartState.items.find((item: any) => item.type);
        setReturnOrderHistory(history);
        
        const lineItems = history?.lineItems
          .map((lineItem: any) => ({
            ...lineItem.product,
            cost: lineItem.itemPrice,
            quantity: lineItem.quantity
          }))
          .filter((item: any) => 
            item.sku !== 'Discount' && !item.sku.includes('Shipping')
          );

        setCartItems(lineItems);
        setIsHemmingAvailable(lineItems.some((item: any) => item.category === 'Hemming'));
        setSliderValue(Math.abs(lineItems.find((item: any) => item.sku === 'Hemming Discount')?.cost ?? 0));
        setReturnDate(history?.date ? new Date(history.date).toISOString() : new Date().toISOString());
        setReturningItems(lineItems?.filter((item: any) => !item?.ext?.nonReturnable).map((item: any) => item.sku));
        setPaymentType(getCreditCardType(history.tenderItems[0]?.ext.ccType)??'');
        setShippingType(history.lineItems.find((item: any) => (
          item.type !== 'Discount' &&
          item.product.category === 'Shipping'
        ))?.itemSKU || '');
      }

      updateTotalPrice();
      getRepriceForLineItems(false);
    }
  }, [cartState, isReturn]);

  const updateTotalPrice = () => {
    const newSubTotal = calculateSubtotal(cartItems, returningItems);
    setSubTotal(newSubTotal);
    calculateAmount();
  };

  const getCreditCardType = (value: string) => {
    return Object.keys(CcName).find(key => CcName[key as keyof typeof CcName] === value);
  };

  const getShippingAmount = () => 
    shippingProducts.find((shipping) => shippingType === shipping.name)?.cost || 0;

  const calculateAmount = () => {
    const calculateDiscount = () => {
      if (!bestOffers) return 0;
      return bestOffers
        .map((offer: any) => offer?.discount ?? calculateTicketDiscount(discountLineItems))
        .reduce((total: number, discount: number) => total + discount, 0);
    };

    let discountedAmount = subTotal - calculateDiscount();

    if (isHemmingAvailable) {
      discountedAmount -= sliderValue;
    }

    if (shippingType) {
      discountedAmount += getShippingAmount();
    }

    const newTaxAmount = discountedAmount * (tax / 100);
    setTaxAmount(parseFloat(newTaxAmount.toFixed(2)));
    setTotalAmount(parseFloat((discountedAmount + newTaxAmount).toFixed(2)));
  };

  const handlePurchase = async () => {
    try {
      if (isReturn) {
        await handleReturnPurchase();
      } else {
        await handleNormalPurchase();
      }
      
      navigate('/purchase-confirmation');
      memberService.refreshMember();
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    }
  };

  const handleReturnPurchase = async () => {
    await activityService.getActivity(
      createCancellationPayload(returnOrderHistory),
      true
    );

    await activityService.getActivity(
      createAccrualPayload(
        totalAmount,
        prepareLineItems(),
        createTenderItems(paymentType, totalAmount),
        location,
        bestOffers,
        returnDate
      ),
      true
    );
  };

  const handleNormalPurchase = async () => {
    await activityService.getActivity(
      createAccrualPayload(
        totalAmount,
        prepareLineItems(),
        createTenderItems(paymentType, totalAmount),
        location,
        bestOffers,
        returnDate
      ),
      true
    );
  };

  const prepareLineItems = (isReprice = false) => {
    return createLineItems(
      cartItems.filter((item: any) => !returningItems.includes(item.sku)),
      discountLineItems,
      taxAmount,
      isReprice ? 0 : sliderValue,
      shippingProducts.find((shipping: any) => shipping.name === shippingType)
    );
  };

  const getRepriceForLineItems = async (persist: boolean) => {
    if (!cartItems?.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response: any = await activityService.getActivity(
        createRepricePayload(
          totalAmount,
          prepareLineItems(true),
          createTenderItems(paymentType, totalAmount),
          location,
          returnDate
        ),
        persist
      );

      setBestOffers(response.data.bestOffers ?? []);
      setDiscountLineItems(
        response.data.repricedTicket?.lineItems.filter(
          (lineItem: any) => lineItem.type === 'Discount'
        ) ?? []
      );
      setMaxAllowedValue(
        Math.min(
          response.data?.availableHemmingCredit,
          response.data?.maxHemmingDiscount
        ) ?? 0
      );
      calculateAmount();
      getAccrualPoints(persist);
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
      calculateAmount();
    } finally {
      setIsLoading(false);
    }
  };

  const getAccrualPoints = async (persist = false) => {
    setIsLoading(true);
    try {
      const response: any = await activityService.getActivity(
        createAccrualPayload(
          totalAmount,
          prepareLineItems(),
          createTenderItems(paymentType, totalAmount),
          location,
          bestOffers,
          returnDate
        ),
        persist
      );
      
      setEarnSummary(response.data?.earnSummary ?? {});
    } catch (error: any) {
      alertService.errorAlert(error?.error?.error || error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (event: SelectChangeEvent<number>, item: any) => {
    const newQuantity = Number(event.target.value);
    if (!returningItems.includes(item.sku)) {
      dispatch(addItem({ item: { ...item, quantity: newQuantity } }));
    }
  };

  const handleRemoveItem = (item: any) => {
    dispatch(removeItem({ itemId: item.sku }));
    setReturningItems([...returningItems, item.sku]);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleReturnItem = (sku: string) => {
    const index = returningItems.indexOf(sku);
    if (index > -1) {
      setReturningItems(returningItems.filter(item => item !== sku));
    } else {
      setReturningItems([...returningItems, sku]);
    }
    updateTotalPrice();
    getRepriceForLineItems(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LinearProgress />
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-center items-center flex-1">
      <div className="flex flex-row justify-start items-start flex-[70%] gap-6 bg-white p-5">
        <div className="flex flex-col justify-evenly flex-[70%] gap-1">
          <h1>{isReturn ? 'Return' : 'Purchase'}</h1>

          {/* Cart Items */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <h3>My Bag ({cartItems.filter(item => !item?.ext?.hideInMSSP).length})</h3>
              {cartItems.length > 0 && (
                <Button
                  onClick={handleClearCart}
                  className="remove-all-btn"
                >
                  <span className="text-sm text-black">
                    {isReturn ? 'Return All Items' : 'Remove All Items'}
                  </span>
                </Button>
              )}
            </div>

            {!cartItems.length ? (
              <NoData>No products are available in the cart.</NoData>
            ) : (
              cartItems.map((item, index) => (
                !item?.ext?.hideInMSSP && (
                  <Card key={index} className="p-5 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-1/6">
                        <img src={item.url} alt={item.name} className="w-full h-auto" />
                      </div>
                      
                      <div className="flex-1">
                        <h4>{item.name}</h4>
                        <p>{formatCurrency(item.cost)}</p>
                      </div>

                      <FormControl>
                        <Select
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(e, item)}
                          disabled={isReturn}
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <MenuItem key={num} value={num}>{num}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <div className="text-right">
                        <p>{formatCurrency(item.cost * item.quantity)}</p>
                        {!isReturn ? (
                          <IconButton onClick={() => handleRemoveItem(item)}>
                            <DeleteIcon />
                          </IconButton>
                        ) : (
                          <FormControl>
                            <Select
                              value={returningItems.includes(item.sku) ? 'return' : 'retain'}
                              onChange={() => handleReturnItem(item.sku)}
                              disabled={item?.ext?.nonReturnable || isLoading}
                            >
                              <MenuItem value="return">Return</MenuItem>
                              <MenuItem value="retain">Retain</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      </div>
                    </div>
                    
                    {item?.ext?.nonReturnable && (
                      <small className="text-red-500">Non Returnable</small>
                    )}
                  </Card>
                )
              ))
            )}
          </div>

          {/* Payment Section */}
          <div className="border-gray rounded-lg p-4">
            <SectionHead>Payment Type</SectionHead>
            <FormControl fullWidth>
              <Select
                value={paymentType}
                onChange={(e) => {
                  setPaymentType(e.target.value);
                  if (!isReturn) {
                    getRepriceForLineItems(false);
                  }
                }}
                disabled={isReturn}
              >
                {Object.entries(PaymentCards).map(([key, value]) => (
                  <MenuItem key={key} value={key}>{value}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {shippingList.length > 0 && (
              <>
                <SectionHead>Shipping</SectionHead>
                <FormControl fullWidth>
                  <Select
                    value={shippingType}
                    onChange={(e) => {
                      setShippingType(e.target.value);
                      getRepriceForLineItems(false);
                    }}
                    disabled={isReturn}
                  >
                    {shippingList.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-gray rounded-lg p-4">
            <SectionHead>Order Summary</SectionHead>
            
            <LineItem lineItem={{ label: 'Subtotal', value: subTotal, currency: 'USD' }} />
            
            {shippingType && (
              <LineItem
                lineItem={{
                  label: shippingType,
                  value: getShippingAmount(),
                  currency: 'USD'
                }}
              />
            )}

            {bestOffers?.map((offer, index) => (
              <LineItem
                key={index}
                lineItem={{
                  label: offer.name,
                  value: -(offer?.discount ?? calculateTicketDiscount(discountLineItems)),
                  currency: 'USD',
                  color: 'green'
                }}
              />
            ))}

            {isHemmingAvailable && sliderValue > 0 && (
              <LineItem
                lineItem={{
                  label: 'Hemming Discount',
                  value: -sliderValue,
                  currency: 'USD',
                  color: 'green'
                }}
              />
            )}

            <LineItem
              lineItem={{
                label: `Tax(${tax}%)`,
                value: taxAmount,
                currency: 'USD'
              }}
            />

            <LineItem
              lineItem={{
                label: 'Estimated Total',
                value: totalAmount,
                currency: 'USD',
                size: 'medium'
              }}
            />

            {Object.keys(earnSummary).map((key) => (
              <React.Fragment key={key}>
                <SectionHead>{key}</SectionHead>
                {earnSummary[key].map((item: any, index: number) => (
                  <LineItem
                    key={index}
                    lineItem={{
                      label: item.description,
                      value: item.value,
                      currency: item.currencyCode,
                      color: item.color,
                      size: item.description === (item.varName + ' ' + key) ? 'medium' : ''
                    }}
                  />
                ))}
              </React.Fragment>
            ))}

            <div className="p-5 w-full">
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handlePurchase}
                className="purchase-button"
              >
                {isReturn ? 'Complete' : 'Purchase'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};