import React, { useEffect, useState } from 'react';
import { Card, CardContent, Button } from '@mui/material';
import { useActivityService } from '../../hooks/useActivityService';
import { CardMiniSkeleton } from '../skeletons/CardMiniSkeleton';
// import type { Campaign } from '../../models/campaigns';
import { NoData } from '../common/no-data/NoData';
import useAlertService from '@/hooks/useAlertService';
// import { Campaigns } from '@/models/campaigns';
import { Coupon } from '@/models/coupon';

export const CampaignsList: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Coupon[]>([]);
  const activityService = useActivityService();
  const alertService = useAlertService();
  const staticDate = new Date('10/11/2024');

  useEffect(() => {
    try{
      const campaigns: any = activityService.getCoupons();
      setCampaigns(campaigns);
      setIsLoading(false);
    }
    catch(error: any){
      alertService.errorAlert(error?.error?.error || error?.message);
      setIsLoading(false)
    }
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