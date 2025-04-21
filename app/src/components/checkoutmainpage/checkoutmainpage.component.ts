import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { concatMap, filter, Subscription } from 'rxjs';
import { CcName, PaymentCards } from '../../enums/cc-type';
import { CheckoutHelper } from '../../helpers/checkout/checkout.helper';
import { Member } from '../../models/member';
import { StandardCurrencyPipe } from "../../pipes/standard-currency/standard-currency.pipe";
import { ActivityService } from '../../services/activity.service';
import { AlertService } from '../../services/alert/alert.service';
import { MemberService } from '../../services/member/member.service';
import { ProductService } from '../../services/product/product.service';
import { addItem, clearCart, removeItem } from '../../states/actions/cart.action';
import { LineItemComponent } from "../common/line-item/line-item.component";
import { NoDataComponent } from "../common/no-data/no-data.component";
import { SectionHeadComponent } from "../common/section-head/section-head.component";

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    MatExpansionModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    FlexLayoutModule,
    MatCardModule,
    MatFormFieldModule,
    MatGridListModule,
    MatDividerModule,
    MatIconModule,
    RouterModule,
    MatCheckboxModule,
    FormsModule,
    StandardCurrencyPipe,
    MatSliderModule,
    NoDataComponent,
    LineItemComponent,
    SectionHeadComponent
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private activityService = inject(ActivityService);
  private alertService = inject(AlertService);
  private memberService = inject(MemberService);
  private productService = inject(ProductService);

  private readonly HEMMING_CATEGORY = 'Hemming';
  private readonly DISCOUNT_CATEGORY = 'Discount';
  private readonly TAX_SKU = 'Tax';
  private readonly SHIPPING_CATEGORY = 'Shipping';
  private readonly HEMMING_SKU = 'Hemming Discount';

  tax = 0
  isLoading = true;
  earnSummary: any = {};
  bestOffers: any = [];
  discountLineItems: any = [];
  sliderValue = 0;
  maxAllowedValue = 0;
  isHemmingAvailable = false;
  subscriptions: Subscription[] = [];
  formGroup: FormGroup = new FormGroup({});
  paymentTypeEnum: typeof PaymentCards = PaymentCards;
  memberInfo!: Member;
  subTotal = 0;
  cartItems: any = []
  paymentTypeCtrl = new FormControl();
  shippingTypeCtrl = new FormControl();
  totalAmount = 0;
  isReturn: boolean = false;
  returnOrderHistory: any;
  returningItems: any = [];
  taxAmount = 0;
  totalPoints = 0;
  returnDate: string | null = null;
  quantity: number = 1;
  location: string = '';
  shippingProducts: any = [];
  shippingList: any;
  objectKeys = Object.keys;
  repricedTicket: any;

  async ngOnInit() {
    this.paymentTypeCtrl.setValue('CREDIT_CARD');
    this.subscriptions.push(
      this.productService.getOtherProducts(this.SHIPPING_CATEGORY, this.DISCOUNT_CATEGORY).subscribe({
        next: (products) => {
          this.shippingProducts = products;
          this.shippingList = products.map((product: any) => product.name);
          this.shippingTypeCtrl.setValue(this.shippingList[0]);
        },
        error: (error) => { this.alertService.errorAlert(error?.error?.error || error?.message); }
      }),
      this.productService.getOtherProducts(this.TAX_SKU, '').subscribe({
        next: (products) => {
          this.tax = products.find((product: any) => product.sku === this.TAX_SKU)?.cost ?? 0;
        },
        error: (error) => { this.alertService.errorAlert(error?.error?.error || error?.message); }
      }),
      this.route.queryParams
        .pipe(
          filter((params) => params.hasOwnProperty('isReturn'))
        )
        .subscribe((params) => {
          this.isReturn = params['isReturn'] === 'true';
        }),
      this.store.select('member').subscribe((member: Member) => {
        if (Object.keys(member).length) {
          if (this.memberInfo && this.memberInfo.loyaltyId !== member.loyaltyId) {
            this.memberInfo = member;
            this.paymentTypeCtrl.setValue('CREDIT_CARD');
            this.cartItems = [];
            this.store.dispatch(clearCart());
          } else {
            this.memberInfo = member;
          }
        }
      }),
      this.store.select('location').subscribe((location) => {
        if (location.location !== this.location) {
          this.location = location.location;
          if (!this.isReturn) {
            this.getRepriceForLineItems(false)
          }
        }
      })
      ,
      this.store.select('cart').subscribe((cart) => {
        this.setCartItems(cart);
      })
    );
  }

  setCartItems(cart: any) {
    this.isHemmingAvailable = cart.items.some((item) => item.category === this.HEMMING_CATEGORY)
    this.cartItems = cart?.items ?? [];
    if (this.isReturn) {
      this.returnOrderHistory = cart.items.find((history: any) => history.type);
      this.cartItems = this.returnOrderHistory?.lineItems.map((lineItem: any) => ({ ...lineItem.product, cost: lineItem.itemPrice, quantity: lineItem.quantity }))
      .filter(item => item.sku !== this.DISCOUNT_CATEGORY || item.sku.includes(this.SHIPPING_CATEGORY));
      this.isHemmingAvailable = this.cartItems.some((item) => item.category === this.HEMMING_CATEGORY);
      this.sliderValue = Math.abs(this.cartItems.find(item => item.sku === this.HEMMING_SKU)?.cost ?? 0);
      this.returnDate = this.returnOrderHistory?.date ? new Date(this.returnOrderHistory.date).toISOString() : new Date().toISOString();
      this.returningItems = this.cartItems?.filter(item => !item?.ext?.nonReturnable).map((item: any) => item.sku);
      this.paymentTypeCtrl.setValue(this.getCreditCardType(this.returnOrderHistory.tenderItems[0]?.ext.ccType));
      this.shippingTypeCtrl.setValue(this.returnOrderHistory.lineItems.find((item: any) => (
        item.type !== this.DISCOUNT_CATEGORY &&
        item.product.category === this.SHIPPING_CATEGORY
      ))?.itemSKU);
      this.disableFormControlsForReturn();
    }
    this.updateTotalPrice();
    this.getRepriceForLineItems(false);
  }

  updateTotalPrice() {
    this.subTotal = CheckoutHelper.calculateSubtotal(this.cartItems, this.returningItems);
    this.calculateAmount();
  }

  getShippingAmount = () => this.shippingProducts.find((shipping) => this.shippingTypeCtrl.getRawValue() === shipping.name)?.cost;

  prepareLineItems(isReprice = false) {
    return CheckoutHelper.createLineItems(
      this.cartItems.filter((item: any) => !this.returningItems.includes(item.sku)),
      this.discountLineItems,
      this.taxAmount,
      isReprice ? 0 : this.sliderValue,
      this.shippingProducts.find((shipping: any) => shipping.name === this.shippingTypeCtrl.value))
  }

  getCreditCardType(value: string) {
    return Object.keys(CcName).find(key => CcName[key as keyof typeof CcName] === value);
  }

  getRepriceForLineItems(persist: boolean) {
    if (!this.cartItems?.length) {
      this.isLoading = false;
      return
    }

    this.isLoading = true;
    this.subscriptions.push(
      this.activityService.getActivity(
        CheckoutHelper.createRepricePayload(
          this.totalAmount,
          this.prepareLineItems(true),
          CheckoutHelper.createTenderItems(this.paymentTypeCtrl.value, this.totalAmount),
          this.location,
          this.returnDate
        ), persist).subscribe({
          next: (res: any) => {
            this.bestOffers = res.data.bestOffers ?? [];
            this.discountLineItems = res.data.repricedTicket?.lineItems.filter((lineItem: any) => lineItem.type === this.DISCOUNT_CATEGORY) ?? [];
            this.maxAllowedValue = Math.min(res.data?.availableHemmingCredit, res.data?.maxHemmingDiscount) ?? 0;
            this.isLoading = false;
            this.isLoading = true;
            this.calculateAmount();
            this.repricedTicket = res.data.repricedTicket;
            this.getAccrualPoints(persist);
          },
          error: (error) => {
            this.isLoading = false;
            this.calculateAmount();
            this.alertService.errorAlert(error?.error?.error || error?.message)
          }
        })
    )

  }
  disableFormControlsForReturn() {
    if (this.isReturn) {
      this.paymentTypeCtrl.disable();
      this.shippingTypeCtrl.disable();
    }
  }

  getAccrualPoints(persist = false){
    this.isLoading = true;
    this.updateTotalPrice();
    this.subscriptions.push(
      this.activityService.getActivity(
        CheckoutHelper.createAccrualPayload(
          this.totalAmount,
          persist ? this.prepareLineItems() : (this.repricedTicket?.lineItems ?? this.prepareLineItems()),
          CheckoutHelper.createTenderItems(this.paymentTypeCtrl.value, this.totalAmount),
          this.location,
          this.bestOffers,
          this.returnDate
        ), persist).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            this.earnSummary = res.data?.earnSummary ?? {};
            this.totalPoints = 0
          },
          error: (error) => {
            this.isLoading = false;
            this.alertService.errorAlert(error?.error?.error || error?.message);
          },
          complete: () => {
            this.isLoading = false;
          }
        })
    )
  }



  purchaseItems() {
    if (this.isReturn) {
      this.subscriptions.push(
        this.activityService
          .getActivity(
            CheckoutHelper.createCancellationPayload(this.returnOrderHistory),
            true
          )
          .pipe(
            concatMap(() =>
              this.activityService.getActivity(
                CheckoutHelper.createAccrualPayload(
                  this.totalAmount,
                  this.prepareLineItems(),
                  CheckoutHelper.createTenderItems(this.paymentTypeCtrl.value, this.totalAmount),
                  this.location,
                  this.bestOffers,
                  this.returnDate
                ),
                true
              )
            )
          )
          .subscribe({
            next: () => {
              this.router.navigate(['/purchase-confirmation']);
              this.memberService.refreshMember();
            },
            error: (error) => {
              this.isLoading = false;
              this.alertService.errorAlert(error?.error?.error || error?.message);
            },
          })
      );
    } else {
      this.subscriptions.push(
        this.activityService
          .getActivity(
            CheckoutHelper.createAccrualPayload(
              this.totalAmount,
              this.prepareLineItems(),
              CheckoutHelper.createTenderItems(this.paymentTypeCtrl.value, this.totalAmount),
              this.location,
              this.bestOffers,
              this.returnDate
            ),
            true
          )
          .subscribe({
            next: () => {
              this.router.navigate(['/purchase-confirmation']);
              this.memberService.refreshMember();
            },
            error: (error) => {
              this.isLoading = false;
              this.alertService.errorAlert(error?.error?.error || error?.message);
            },
          })
      );
    }
  }

  clearCart = () => this.store.dispatch(clearCart());

  async removeFromCart(product) {
    this.store.dispatch(removeItem({ itemId: product.sku }));
    this.returningItems.push(product.sku);

  }

  calculateAmount() {
    const calculateDiscount = () => {
      if (!this.bestOffers) return 0;

      return this.bestOffers
        .map((offer: any) => offer?.discount ?? CheckoutHelper.calculateTicketDiscount(this.discountLineItems))
        .reduce((total: number, discount: number) => total + discount, 0);
    };

    const applyTax = (amount: number) => {
      const taxAmount = amount * (this.tax / 100);
      return {
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        totalWithTax: parseFloat((amount + taxAmount).toFixed(2)),
      };
    };

    let discountedAmount = this.subTotal - calculateDiscount();

    if (this.isHemmingAvailable) {
      discountedAmount -= this.sliderValue;
    }

    if (this.shippingTypeCtrl.value) {
      discountedAmount += this.getShippingAmount();
    }

    const { taxAmount, totalWithTax } = applyTax(discountedAmount);

    this.taxAmount = taxAmount;
    this.totalAmount = totalWithTax;
  }

  selectCc() {
    if (this.paymentTypeCtrl.value && !this.isReturn) {
      this.getRepriceForLineItems(false);
    }
  }

  returnZero = () => 0;

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
    if (this.isReturn) {
      this.store.dispatch(clearCart());
    }
  }
  calculateTicketDiscount = () => CheckoutHelper.calculateTicketDiscount(this.discountLineItems);

  isReturning = (item: any) => this.returningItems.includes(item);

  updateSelectedItem(item: any) {
    const index = this.returningItems.indexOf(item);
    if (index > -1) {
      this.returningItems.splice(index, 1);
    } else {
      this.returningItems.push(item);
    }
    this.updateTotalPrice();
    this.getRepriceForLineItems(false);
  }

  onSelectionChange(event: MatSelectChange, cartItem: any) {
    if (this.returningItems.indexOf(cartItem.sku) === -1) {
      this.store.dispatch(addItem({ item: { ...cartItem, quantity: event.value } }));
    }
  }


  formatLabel(value: number): string {
    return `${value}%`; // Customize slider label as percentage
  }

  getBagLength = () => this.cartItems.filter((cartItem) => !cartItem?.ext?.hideInMSSP).length;
}
