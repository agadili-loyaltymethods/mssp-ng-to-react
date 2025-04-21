import React, { useState } from 'react';
import { Card, Icon, Chip, LinearProgress } from '@mui/material';

interface RewardsChallengesProps {
  streakSkeleton: boolean;
}

export const RewardsChallenges: React.FC<RewardsChallengesProps> = ({ streakSkeleton }) => {
  const [selectedStreakCategory, setSelectedStreakCategory] = useState('Active');
  const streakCategories = ['Active', 'Ended'];
  const [streaks, setStreaks] = useState<any[]>([]);

  if (streakSkeleton) {
    return (
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3].map((widget) => (
          <Card key={widget} className="p-5 flex-[50%]">
            <div className="skeleton">
              <div className="skeleton-left">
                <div className="line h-40 w-100p mb-10"></div>
                <div className="line h-12 w-100p mb-10"></div>
                <div className="line h-10 w-100p mb-5"></div>
                <div className="line h-10 w-100p mb-5"></div>
                <div className="line h-10 w-100p mb-5"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col card-style bg-white p-20 flex-[50%]">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center">
          <h3 className="mt-10 mb-20">Encore Rewards Challenges</h3>
          <button className="refresh-btn" onClick={() => {}}>
            <Icon>refresh</Icon>
          </button>
        </div>
        <div className="filter-container mb-20">
          <small>
            <div className="flex gap-2">
              {streakCategories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => setSelectedStreakCategory(category)}
                  color={selectedStreakCategory === category ? "primary" : "default"}
                  className={selectedStreakCategory === category ? "disable-click" : ""}
                />
              ))}
            </div>
          </small>
        </div>
      </div>

      {!streaks.length ? (
        <div className="flex flex-col items-center justify-center empty-challenges p-20">
          <div className="text-center color-gray mb-20">
            {selectedStreakCategory === 'Active' ? (
              <>
                <p>You are currently not participating in any challenges</p>
                <p>Join a challenge to start earning rewards!</p>
              </>
            ) : (
              <p>You haven't completed any challenges yet</p>
            )}
          </div>

          {selectedStreakCategory === 'Active' && (
            <button className="get-started-btn">
              Get Started
            </button>
          )}
        </div>
      ) : (
        streaks.map((step, index) => (
          <div key={index} className="mb-20">
            {/* Challenge content here */}
          </div>
        ))
      )}
    </div>
  );
};