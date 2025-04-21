import React from 'react';
import { Card, Icon, LinearProgress } from '@mui/material';

interface TierStatusProps {
  widget: any;
  index: number;
}

export const TierStatus: React.FC<TierStatusProps> = ({ widget, index }) => {
  return (
    <Card className="p-20 card-style flex-[25%]">
      <div className="tier-status-section">
        <h3 className="section-title">
          {index === 0 ? 'Encore Tier Status' : 'GCGC Tier Status'}
        </h3>
        <div className="tier-card">
          <div className={`tier-badge ${index === 0 ? 'encore' : 'ruby'}`}>
            <div className="tier-icon-wrapper">
              <Icon className="tier-icon">diamond</Icon>
            </div>
            <h2>{widget.currentTier}</h2>
          </div>
          <div className="tier-progress">
            {widget.nextTier !== widget.currentTier ? (
              <>
                <div className="flex flex-row justify-between items-center">
                  <span className="progress-label">Progress to {widget.nextTier}</span>
                  <span className="progress-percentage">
                    {((widget.totalSpends / widget.nextMilestone) * 100).toFixed(0)}%
                  </span>
                </div>
                <LinearProgress 
                  variant="determinate" 
                  value={(widget.totalSpends / widget.nextMilestone) * 100}
                  className="tier-progress-bar"
                />
                <div className="progress-stats">
                  <span className="current-points">
                    {widget.totalSpends.toLocaleString()} points
                  </span>
                  <span className="points-needed">
                    {(widget.nextMilestone - widget.totalSpends).toLocaleString()} to next tier
                  </span>
                </div>
              </>
            ) : (
              <span className="color-green text-center winning-text">
                Congratulations! You have achieved the Top Tier
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};