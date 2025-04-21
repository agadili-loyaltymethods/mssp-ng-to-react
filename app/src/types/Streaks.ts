import { Goals } from "@/models/goals";

export interface Streaks {
  name: string;
  value: number;
  desc: string;
  status: string;
  icon?: string;
  target: number;
  fragment?: string;
  url?: string;
}

export class StreaksHelper {
  static createStreak(streak: Goals, streakInfo: any): Streaks {
    return {
      name: streak.name,
      value: streak.value ?? 0,
      target: streak.target ?? 0,
      status: streak.status ?? '',
      desc: streakInfo.desc,
      icon: streakInfo.icon ?? '',
      fragment: streakInfo.fragment,
      url: streakInfo.url
    };
  }
}
