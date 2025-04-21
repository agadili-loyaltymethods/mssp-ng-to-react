import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterModule } from '@angular/router';
import { State, Store } from '@ngrx/store';
import { Color, NgxChartsModule } from '@swimlane/ngx-charts';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { Streaks } from '../../classes/streaks/streaks';
import { Widget } from '../../classes/widget/widget';
import { ColorScheme } from '../../constants/color-scheme';
import { GeneralConstants } from '../../constants/general-constants';
import { StreaksConstants } from '../../constants/streaks-constants';
import { CouponEnum } from '../../enums/coupon-enum';
import { StreaksCategory } from '../../enums/streaks-category';
import { Member } from '../../models/member';
import { StreakPolicy } from '../../models/streak-policy';
import { StreakProgressSelections } from '../../models/streak-progress-selections';
import { StandardCurrencyPipe } from "../../pipes/standard-currency/standard-currency.pipe";
import { ActivityService } from '../../services/activity.service';
import { AlertService } from '../../services/alert/alert.service';
import { MemberService } from '../../services/member/member.service';
import { AppTimerComponent } from '../app-timer/app-timer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, RouterModule, FlexLayoutModule, CommonModule, MatProgressBarModule, MatIconModule, MatButtonModule, NgxChartsModule, MatDividerModule, StandardCurrencyPipe, MatChipsModule,
    AppTimerComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  state = inject(State);
  private readonly EXPIRED = 'Expired';
  private readonly COMPLETE = 'Complete';
  private readonly ACTIVE = 'Active'

  memberInfo?: Member;
  memberTier = "";
  colorScheme: Color = ColorScheme;
  widgetData: any = [];
  streaks: StreakPolicy[] = [];
  minThreshold: number = 0;
  maxThreshold: number = 100;
  widgetSkeleton = true;
  streakSkeleton = true;
  subscriptions: Subscription[] = [];
  chartData = [];
  streakInfo: any;
  streakBonus: number = 0;
  panelOpenState = false;
  displayStreakProgress = false;

  steps: StreakPolicy[] = [];
  selectedStreakCategory: StreaksCategory = StreaksCategory.ACTIVE;

  streakCategories: StreaksCategory[] = [StreaksCategory.ACTIVE, StreaksCategory.Ended];
  streakViewProgressSelections: StreakProgressSelections = { previousTab: StreaksCategory.ACTIVE, viewProgressSelections: [] };
  providerPoints: any = []
  constructor(
    private memberService: MemberService,
    private alertService: AlertService,
    private activityService: ActivityService,
    private router: Router,
    public dialog: MatDialog,
  ) { }
  ngOnInit() {
    this.subscriptions.push(
      this.store.select('member').subscribe((member: Member) => {
        if (Object.keys(member).length) {
          this.widgetSkeleton = true;
          this.streakSkeleton = true;
          this.memberInfo = member;
          this.memberTier = this.memberInfo.tiers[0].level.name;
          this.getWidgetData();
          this.getPurseValues();
          this.getStreakInfo();
        }
      })
    );
  }

  getPurseValues() {
    if (this.memberInfo) {
      this.providerPoints = this.memberInfo.purses.filter((purse) => !purse.name.includes('Status')).map((purse) => ({
        provider: purse.name,
        balance: purse.availBalance
      }))
    }
  }

  calculateAverage = (streak) => (streak.target ? ((streak.value / streak.target) * 100)?.toFixed(0) : 0);

  getChartData(streak) {
    return [{ name: streak.name, value: streak.value }]
  }

  isString = (value) => typeof value === 'string';
  isArray = (value) => Array.isArray(value) && value.every(item => item && typeof item.title === 'string');

  isGoalsCompleted = () => this.streaks.every((streak) => streak.status === 'Complete');

  async getStreakInfo(isRefresh: boolean = false) {
    this.activityService.getStreakPolicy().subscribe({
      next: (res) => {
        this.streakSkeleton = true;
        this.streakInfo = res;
        this.steps = this.streakInfo.map((data) => {
          return {
            ...data,
            icon: 'pending',
            status: 'pending',
            timeRemaining: (data.timeLimit ?? 0) / 1440,
            rewards: data?.ext?.rewards ?? [],
            goals: data?.goalPolicies ?? []
          }

        });
        this.fetchStreaks(isRefresh);
      },
      error: (error) => {
        this.alertService.errorAlert(error?.error?.error || error?.message);
        this.streakSkeleton = false;
      },
    });
  }

  async fetchStreaks(isRefresh: boolean = false) {
    try {
      await this.getStreaksPR(GeneralConstants.streakProgress, isRefresh);
      //await this.getStreaks(isRefresh);
    } catch (error: any) {
      this.alertService.errorAlert(error?.error?.error || error?.message);
    }

  }

  updateConstant() {
    StreaksConstants.forEach((streak, idx) => {
      const matchingPolicy = this.streakInfo.goals[idx];
      if (matchingPolicy) {
        streak.desc = matchingPolicy.description;
      }
    });
  }

  async getStreaks(isRefresh: boolean = false) {
    this.streakSkeleton = true;
    await this.memberService.getStreaks(this.memberInfo?._id ?? '').subscribe({
      next: (streaksResp: any) => {
        this.streakSkeleton = false;
        if (isRefresh) {
          this.prepopulateStreakPrevInfo();
        }
      },
      error: (error) => {
        this.alertService.errorAlert(error?.error?.error || error?.message);
        this.streakSkeleton = false;
      },
    });
  }

  getStreakBonus() {
    this.activityService.getActivity(this.getActivityPayload(GeneralConstants.streakProgress)).subscribe({
      next: (res: any) => this.streakBonus = res.data.streakProgress?.streakBonus,
      error: (error) => this.alertService.errorAlert(error?.error?.error || error?.message)
    })
  }

  getWidgetData() {
    const request: Observable<any>[] = [];
    Object.values(CouponEnum).forEach((val) => (request.push(
      this.activityService.getActivity(this.getActivityPayload(val))
    )));
    forkJoin(request).subscribe({
      next: (widgets: Widget[]) => {
        this.widgetData = widgets.map((widget: Widget) => new Widget(widget));
        this.widgetSkeleton = false;
      },
      error: (error) => {
        this.alertService.errorAlert(error?.error?.error || error?.message);
        this.widgetData = Object.values(CouponEnum).map(() => new Widget({}));
        this.widgetSkeleton = false
      }
    });
  }

  getActivityPayload(coupon: string) {
    return {
      type: coupon === GeneralConstants.streakProgress ? GeneralConstants.streakProgress : 'Personalization',
      date: new Date().toISOString(),
      srcChannelType: 'Web',
      couponCode: coupon === GeneralConstants.streakProgress ? this.memberInfo?.streaks[0]?._id : coupon,
      srcChannelID: 'Corporate',
      loyaltyID: this.memberInfo?.loyaltyId
    };
  }

  navigateToRewards() {
    this.router.navigate(['/rewards'], { fragment: 'Vouchers' });
  }

  navigateToGoals(streak: Streaks) {
    this.router.navigate([streak.url], { fragment: streak.fragment ?? '' })
  }
  selectStreakCategory(category: StreaksCategory) {
    this.selectedStreakCategory = category;
    this.streakViewProgressSelections.previousTab = this.selectedStreakCategory;
    if (this.selectedStreakCategory === StreaksCategory.Ended) {
      this.streaks = this.steps.filter((data) => data.status === this.COMPLETE || data.status === this.EXPIRED);
    } else if (this.selectedStreakCategory === StreaksCategory.ACTIVE) {
      this.streaks = this.steps.filter((data) => data.status === this.ACTIVE);
    } else {
      this.streaks = this.steps;
    }
  }

  async getStreaksPR(code: string, isRefresh: boolean = false) {
    this.streakSkeleton = true;
    let payload = {
      type: "Personalization",
      srcChannelType: "Web",
      srcChannelID: this.state.getValue().location.location,
      loyaltyID: this.memberInfo?.loyaltyId,
      couponCode: code,
      date: new Date().toISOString()
    }
    await this.activityService.getActivity(payload).subscribe({
      next: (res: any) => {
        this.streakSkeleton = false;
        if (res.data?.streaksProgress?.length) {
          this.steps = res.data?.streaksProgress.map(sp => ({
            ...sp.streak,
            goalCompleted: `${sp.goals.filter(a => a.status === this.COMPLETE).length}/${sp.streak.noOfGoals}`,
            icon: this.getStatusIconName(sp.streak.status),
            goals: sp.goals,
            rewards: sp.streak.rewards ?? (sp.goals.length ? sp.goals.flatMap(a => a.rewards) : []),
            streakId: sp.streakId
          }))
          if (!isRefresh) {
            this.selectStreakCategory(StreaksCategory.ACTIVE);
          }
          else {
            this.prepopulateStreakPrevInfo();
          }
        }
      },
      error: (error) => {
        this.streakSkeleton = false;
        this.alertService.errorAlert(error?.error?.error || error?.message)
      }
    })
  }

  toggleViewProgress(step: StreakPolicy, streakElemId: string) {
    if (step) {
      step.displayProgress = !step.displayProgress;
      if (step.displayProgress) {
        this.streakViewProgressSelections.viewProgressSelections.push(streakElemId);
      }
      else {
        this.streakViewProgressSelections.viewProgressSelections = this.streakViewProgressSelections.viewProgressSelections.filter((ids: string) => ids != streakElemId);
      }
    }
  }

  prepopulateStreakPrevInfo() {
    this.selectedStreakCategory = this.streakViewProgressSelections.previousTab;
    this.selectStreakCategory(this.selectedStreakCategory);
    if (this.streakViewProgressSelections.viewProgressSelections.length) {
      this.streakViewProgressSelections.viewProgressSelections.forEach((streakId: string) => {
        this.streaks.filter(streak => streak.streakId == streakId).forEach(streak => streak.displayProgress = true);
      });
    }
  }

  getStatusIconName(status: string) {
    if (status === this.COMPLETE) {
      return 'check_circle';
    } else if (status === this.ACTIVE) {
      return 'check';
    } else if (status === this.EXPIRED) {
      return 'warning';
    } else {
      return 'pending';
    }
  }

  async streakOptinPR() {
   
    this.streakSkeleton = true;
    let payload = {
      type: "Streak Optin",
      srcChannelType: "Web",
      srcChannelID: this.state.getValue().location.location,
      loyaltyID: this.memberInfo?.loyaltyId,
      couponCode: "Double Play Challenge",
      date: new Date().toISOString()
    }
    await this.activityService.getActivity(payload).subscribe({
      next: (res: any) => {
        this.streakSkeleton = false;
        this.fetchStreaks();
      },
      error: (error) => {
        this.streakSkeleton = false;
        this.alertService.errorAlert(error?.error?.error || error?.message)
      }
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe())
  }
}