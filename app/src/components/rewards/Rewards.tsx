import { Reward } from "@/types";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RewardsWallet } from "../rewards-wallet/RewardsWallet";
import { Offers } from "../offers/Offers";
import { ClippableCoupons } from "../clippable-coupons/ClippableCoupons";
import { Quiz } from "@mui/icons-material";
import { QuizPage } from "../quiz/Quiz";

const tabs = ["Rewards Wallet", "Exclusive Offers", "Clippable Coupons", "Survey"];

export const Rewards: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Rewards Wallet");
  const [selectedTab, setSelectedTab] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const tabUrls = Object.values(Reward);

  useEffect(() => {
    const fragment = location.hash.replace('#', '');
    const decodeFragment = decodeURIComponent(fragment || '');
      const tabIndex = tabUrls.findIndex(tab => tab.toUpperCase() === decodeFragment.toUpperCase());
      setSelectedTab(tabIndex > 0 ? tabIndex : 0);
      setActiveTab(tabUrls[tabIndex > 0 ? tabIndex : 0]);
      console.log('fragment',fragment);
  }, [location.hash]);

  useEffect(() => {
    console.log('activeTab', activeTab)
  }, [activeTab]);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    window.location.hash = "#"+tabName;
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] px-6 py-8 flex flex-col items-center">
      {/* Tabs Navigation */}
      <div className="flex justify-center bg-[#f7e9e4e6] rounded-full shadow-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`
                text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-[#FF8201] px-5 py-[5px] text-white shadow-md rounded-full"
                  : "text-[#FF8201] hover:bg-[#ffe0cc]"}
              `}
              style={{
                minWidth: "160px",
                height: "48px",
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="w-full">
            {activeTab === 'Rewards Wallet' && <RewardsWallet />}
            {activeTab === 'Exclusive Offers' && <Offers />}
            {activeTab === 'Clippable Coupons' && <ClippableCoupons />}
            {activeTab === 'Survey' && <QuizPage />}
          </div>

    </div>
  );
};

