import { Reward } from "../enums/reward";

export const StreaksConstants = [
    { name: 'Survey', desc: 'Take a quick survey to help us improve.', value: 0, target: 0, status: '', icon: 'checklist_rtl', url: '/rewards', fragment: Reward.QUIZ },
    { name: 'Sweepstake', desc: 'Spend points for a chance to win reward.', value: 0, target: 0, status: '', icon: 'featured_seasonal_and_gifts', url: '/rewards', fragment: Reward.SWEEPSTAKES },
    { name: 'Spend $500', desc: 'Spend over multiple trasactions.', value: 0, target: 0, status: '', url: '/purchase' }
]