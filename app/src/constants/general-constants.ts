import { StreakProgress } from "./streak-progress";

export const GeneralConstants = {
    appMode: 'mode',
    OTP: 6,
    passwordRegEx: /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/,
    currencyList: ['dollars', 'points', 'dollarsAndPoints'],
    taxPercentage: 20,
    minTaxAmount: 5.60,
    centsPerPoint: 1.2,
    externalCouponsLimit: 2,
    streakProgress: 'Streak Progress',
    streakInfo: 'Streak Info'
}