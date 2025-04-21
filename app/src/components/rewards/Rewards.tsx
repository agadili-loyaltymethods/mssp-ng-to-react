
import React, { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { RewardsWallet } from './RewardsWallet';
import { EarnedBenefits } from '../earned-benefits/EarnedBenefits';
import { Offers } from '../offers/Offers';
import { ClippableCoupons } from '../clippable-coupons/ClippableCoupons';
import { Quiz } from '../quiz/Quiz';
import { Reward } from '../../enums/reward';

export const Rewards: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const tabUrls = Object.values(Reward);

  React.useEffect(() => {
    const fragment = location.hash.replace('#', '');
    const tabIndex = tabUrls.findIndex(tab => tab === fragment);
    setSelectedTab(tabIndex > 0 ? tabIndex : 0);
    navigate({ hash: tabUrls[tabIndex > 0 ? tabIndex : 0] });
  }, [location.hash]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    navigate({ hash: tabUrls[newValue] });
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <div className="flex flex-col items-center w-[1300px]">
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            className="w-full mt-5"
            centered
            variant="standard"
            TabIndicatorProps={{ style: { animation: 'none' } }}
          >
            <Tab label="Rewards Wallet" />
            <Tab label="Exclusive Offers" />
            <Tab label="Clippable Coupons" />
            <Tab label="Survey" />
          </Tabs>

          <div className="w-full">
            {selectedTab === 0 && <RewardsWallet />}
            {selectedTab === 1 && <Offers />}
            {selectedTab === 2 && <ClippableCoupons />}
            {selectedTab === 3 && <Quiz />}
          </div>
        </div>
      </div>
    </div>
  );
};
