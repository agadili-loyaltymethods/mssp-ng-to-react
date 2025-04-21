import React from 'react';
import { Card } from '@mui/material';

interface PointsBalanceProps {
  providerPoints: Array<{
    provider: string;
    balance: number;
  }>;
}

export const PointsBalance: React.FC<PointsBalanceProps> = ({ providerPoints }) => {
  return (
    <Card className="p-20 card-style flex-[25%]">
      <div className="points-balance-section">
        <h3 className="section-title">Points Balance</h3>
        <div className="balance-cards">
          <div className="provider-points">
            {providerPoints.map((provider) => (
              <div key={provider.provider} className="provider-item">
                <div className="provider-name">{provider.provider}</div>
                <div className="provider-value">
                  {provider.balance.toLocaleString()} Points
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};