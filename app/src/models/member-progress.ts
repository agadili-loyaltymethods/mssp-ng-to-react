export class MemberProgress {
  baseTier: {
    points: number;
    flights: number;
    pointsThreshold: number;
    flightsThreshold: number;
    tierName: string;
    title: string;
    titleSubscript: string;
    flightsProgressText: string;
    pointsProgressText: string;
    widgetSubscript: string;
    pointsTooltip: string;
    flightsTooltip: string;
  };

  companionTier: {
    points: number;
    flights: number;
    pointsThreshold: number;
    flightsThreshold: number;
    tierName: string;
    title: string;
    titleSubscript: string;
    flightsProgressText: string;
    pointsProgressText: string;
    widgetSubscript: string;
    pointsTooltip: string;
    flightsTooltip: string;
  };

  constructor(baseTier: any, companionPass: any) {
    this.baseTier = {
      points: baseTier.points,
      flights: baseTier.flights,
      pointsThreshold: baseTier.pointsThreshold,
      flightsThreshold: baseTier.flightsThreshold,
      tierName: baseTier.tierName,
      title: baseTier.title,
      titleSubscript: baseTier.titleSubscript,
      flightsProgressText: `${(baseTier.flights).toLocaleString()} out of ${(baseTier.flightsThreshold).toLocaleString()} flights *` ,
      pointsProgressText: `${(baseTier.points).toLocaleString()} out of ${(baseTier.pointsThreshold).toLocaleString()} points *` ,
      widgetSubscript: baseTier.widgetSubscript,
      pointsTooltip: baseTier.pointsTooltip,
      flightsTooltip: baseTier.flightsTooltip,
    };

    this.companionTier = {
      points: companionPass.points,
      flights: companionPass.flights,
      pointsThreshold: companionPass.pointsThreshold,
      flightsThreshold: companionPass.flightsThreshold,
      tierName: companionPass.tierName,
      title: companionPass.title,
      titleSubscript: companionPass.titleSubscript,
      flightsProgressText: `${(companionPass.flights).toLocaleString()} out of ${(companionPass.flightsThreshold).toLocaleString()} flights *` ,
      pointsProgressText: `${(companionPass.points).toLocaleString()} out of ${(companionPass.pointsThreshold).toLocaleString()} points *` ,

      widgetSubscript: companionPass.widgetSubscript,
      pointsTooltip: companionPass.pointsTooltip,
      flightsTooltip: companionPass.flightsTooltip,
    };
  }
}
