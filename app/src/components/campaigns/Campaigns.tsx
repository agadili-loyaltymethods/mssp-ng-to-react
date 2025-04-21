import React, { useEffect, useState } from 'react';
import { Card, CardContent, Button } from '@mui/material';
import { useActivityService } from '../../hooks/useActivityService';
import { useAlertService } from '../../hooks/useAlertService';
import { CardMiniSkeleton } from '../skeletons/CardMiniSkeleton';
import { NoData } from '../common/NoData';
import type { Campaign } from '../../models/campaigns';

export const Campaigns: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const activityService = useActivityService();
  const alertService = useAlertService();
  const staticDate = new Date('10/11/2024');

  useEffect(() => {
    activityService.getCoupons().subscribe({
      next: (campaigns) => {
        setCampaigns(campaigns);
      },
      error: (error) => {
        alertService.errorAlert(error?.error?.error || error?.message);
      },
    }).add(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="mt-12"><CardMiniSkeleton /></div>;
  }

  if (!campaigns.length) {
    return <NoData>No Campaigns available.</NoData>;
  }

  return (
    <div className="flex flex-col mt-5">
      <h3 className="mt-0">Available Campaigns({campaigns.length})</h3>
      <div className="flex flex-row gap-5">
        <div className="flex flex-row flex-wrap gap-2.5 grid">
          {campaigns.map((campaign, index) => (
            <div key={index} className="flex-[0_0_30%]">
              <Card className="border-gray bg-white box-shadow-none">
                <CardContent className="flex flex-col gap-7">
                  <div className="flex flex-row items-center gap-2.5">
                    <img src="assets/icons/nordy-cash.png" alt="Campaign" />
                    <div className="flex flex-col items-start gap-2.5">
                      <h2 className="text-primary">{campaign.name}</h2>
                      <div className="line-height-adjust">{campaign.desc}</div>
                      <small className="text-gray-500">
                        Expires {new Date(staticDate).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-center">
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      className="w-full"
                    >
                      Redeem Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};