import React from 'react';
import { Card, Icon } from '@mui/material';

interface TierBenefitsProps {
  widgetSkeleton: boolean;
  widgetData: any[];
}

export const TierBenefits: React.FC<TierBenefitsProps> = ({ widgetSkeleton, widgetData }) => {
  if (widgetSkeleton) {
    return (
      <div className="flex flex-row gap-10">
        {[1, 2].map((row) => (
          <div key={row} className="flex flex-row gap-10">
            {[1, 2, 3].map((widget) => (
              <Card key={widget} className="p-5 flex-[50%]">
                <div className="skeleton">
                  <div className="skeleton-left">
                    <div className="line h-80 w-100p mb-10"></div>
                    <div className="line h-12 w-100p mb-10"></div>
                    <div className="line h-10 w-100p mb-5"></div>
                    <div className="line h-10 w-100p mb-5"></div>
                    <div className="line h-10 w-100p mb-5"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col card-style bg-white p-20 flex-[50%]">
      <h3 className="mt-10 mb-20">Tier Benefits</h3>
      <div className="flex flex-row flex-wrap gap-5">
        {widgetData[2]?.tierBenefits?.map((benefit: any, index: number) => (
          <div key={index} className="flex-[50%] items-stretch benefit-list">
            <Card className="card-style benefit-card p-10 h-full">
              <div className="flex flex-col gap-0 flex-1 p-0">
                <div className="flex flex-row items-start perk-header gap-2.5">
                  <div className="benefit-thumbnail flex items-center justify-center">
                    <Icon color="primary">{benefit.thumbnail}</Icon>
                  </div>
                  <div className="flex flex-col justify-center items-start flex-1 perk-card">
                    <h3 className="color-accent title">{benefit.title}</h3>
                  </div>
                </div>
                <div className="flex-1 desc-container">
                  {benefit.desc.length === 1 ? (
                    <div className="mb-2 mt-0 mt-4">{benefit.desc[0]}</div>
                  ) : (
                    <ul className="pl-20 mb-2 mt-0 mt-4">
                      {benefit.desc.map((desc: string, i: number) => (
                        <li key={i}><span>{desc}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};