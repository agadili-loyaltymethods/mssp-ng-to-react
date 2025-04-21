import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormControl, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { Store } from '@ngrx/store';
import { Subscription, forkJoin } from 'rxjs';
import { AlertService } from '../../services/alert/alert.service';
import { MemberService } from '../../services/member/member.service';
import { CardMiniSkeletonComponent } from "../card-mini-skeleton/card-mini-skeleton.component";
import { MatDialog } from '@angular/material/dialog';
import { RevertRewardComponent } from '../modals/revert-reward/revert-reward.component';
import { ExpiryCheckPipe } from "../../pipes/expiry-check.pipe";
import { NoDataComponent } from "../common/no-data/no-data.component";
import { ActivityService } from '../../services/activity.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-rewards-wallet',
  standalone: true,
  imports: [
    FlexLayoutModule,
    MatCardModule,
    MatButtonModule,
    CommonModule,
    MatProgressBarModule,
    CardMiniSkeletonComponent,
    MatSidenavModule,
    ExpiryCheckPipe,
    NoDataComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatChipsModule
  ],
  templateUrl: './rewards-wallet.component.html',
  styleUrl: './rewards-wallet.component.scss'
})
export class RewardsWalletComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  @ViewChild('drawer') drawer!: MatSidenav;
  availableVouchers: any = [];
  availableVouchersWithPurse: any = [];
  allVouchers: any = [];
  memberVouchers: any = [];
  isLoading: boolean = true;
  buyVoucherCtrl: FormControl<any> = new FormControl('');
  member: any;
  subscriptions: Subscription[] = [];
  location: string = 'Corporate';
  memberPoints: any = [];
  selectedPointPurse: Record<string, string> = {};

  constructor(public dialog: MatDialog, private memberService: MemberService, private alertService: AlertService, private activityService: ActivityService) { }

  ngOnInit() {
    this.subscriptions.push(
      this.store.select('member').subscribe({
        next: (member) => {
          if (!!Object.keys(member).length) {
            this.isLoading = true;
            this.member = member;
            this.getRewardWallet();
            
          }
        },
        error: (error) => {
          this.alertService.errorAlert(error?.error?.error || error?.message);
          this.isLoading = false;
        }
      }),
      this.store.select('location').subscribe((location) => {
        if (location?.location) {
          this.location = location.location;
          this.drawer?.close();
          this.getRewardWallet();
        }
      })
    );
  }

  isSelectedPointPurseEmpty(): boolean {
    return !this.selectedPointPurse || Object.keys(this.selectedPointPurse).length === 0;
  }

  onPurseSelection(event) {
    this.selectedPointPurse = this.memberPoints.find(point => point.key === event.key);
    this.setAvailableVouchersWithPurse();
  }

  getRewardWallet() {
    this.isLoading = true;
    this.selectedPointPurse = {};
    this.activityService.getActivity(this.getPayload()).subscribe({
      next: (res: any) => {
        const pointsData = res.data.rdBalances;
        this.memberPoints = Object.keys(pointsData).map(key => ({
          key: key,
          value: pointsData[key]
        }));
        this.isLoading = false;
      }, error: (error) => {
        this.isLoading = false;
        this.alertService.errorAlert(error?.error?.error || error?.message);
      }
    }).add(() => this.getVouchers())
  }

  getPayload(coupon = '') {
    return {
      type: !!coupon ? coupon : 'Personalization',
      date: new Date().toISOString(),
      srcChannelType: 'Web',
      couponCode: 'Balance',
      srcChannelID: this.location,
      loyaltyID: this.member?.loyaltyId
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe())
  }

  getVouchers() {
    forkJoin([
      this.memberService.getMemberVouchers(this.member._id),
      this.memberService.getVouchers(this.member)
    ]).subscribe(
      {
        next: (results) => {
          const [memberVouchers, allVouchers] = results;
          this.memberVouchers = memberVouchers.flatMap((voucher) => voucher.rewards);
          this.allVouchers = allVouchers;
          this.setAvailableVouchers();
        },
        error: (error) => {
          this.alertService.errorAlert(error?.error?.error || error?.message);
        }
      }
    ).add(() => this.isLoading = false);
  }

  setAvailableVouchers() {
    const purses = this.memberPoints.map((a) => a.key)
    this.availableVouchers = this.allVouchers.filter((voucher) => voucher.cost > 0 && this.memberPoints.find((point) => (point.key === voucher?.ext?.purseName && point.value >= voucher.cost)))  
    this.selectedPointPurse = this.memberPoints[0];
    this.setAvailableVouchersWithPurse()
  }

  setAvailableVouchersWithPurse() {
    this.availableVouchersWithPurse = this.allVouchers.filter((voucher) => voucher.cost > 0 && voucher.ext.purseName === this.selectedPointPurse['key'])
  }

  isPointSourceValid(voucherName: string, cost: number): boolean {
    const selectedPurse = this.memberPoints.find(point => point.key === this.selectedPointPurse['key']);
    return selectedPurse && selectedPurse.value >= cost;
  }

  redemptionPayload(couponCode: string) {
    return {
      type: 'Redemption',
      srcChannelType: 'Web',
      srcChannelID: this.location,
      date: new Date(),
      loyaltyID: this.member?.loyaltyId,
      couponCode: couponCode,
      ext: {
        purse: this.selectedPointPurse['key']
      }
    };
  }

  buyVoucher(rewardName: string) {
    this.isLoading = true;
    this.activityService.getActivity(this.redemptionPayload(rewardName), true).subscribe({
      next: () => {
        this.memberService.refreshMember();
      },
      error: (error) => {
        this.alertService.errorAlert(error?.error?.error || error?.message);
        this.isLoading = false;
      },
    });
  }

  openDialog(item) {
    this.alertService.closeAlert();
    this.dialog.open(RevertRewardComponent, {
      disableClose: true,
      data: item
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.memberService.refreshMember();
      }
    })
  }
}