import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTokenDetailsHelper } from '@/hooks/useTokenDetailHelper';
import { Locations } from '../locations/Locations';
import { Profile } from '../profile/Profile';
import {
  LayoutDashboard,
  Gift,
  History,
  Hotel,
  Cast as Casino,
  ExternalLink
} from 'lucide-react';

import { MdHistory } from 'react-icons/md';
import { LuDices } from "react-icons/lu";
import { LuHotel } from 'react-icons/lu';
import { FiGift } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const tokenDetailsHelper = useTokenDetailsHelper();

  const openExternalLink = (path: string, query: string = '') => {
    tokenDetailsHelper.openExternalLink(path, query);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: MdDashboard },
    { path: '/rewards', label: 'Rewards', icon: FiGift },
    { path: '/purchase-history', label: 'Activity History', icon: MdHistory },
  ];

  const externalItems = [
    { path: 'hotel-booking', label: 'Hotel Booking', icon: LuHotel },
    { path: 'casino', label: 'Casino', icon: LuDices },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white">
        <nav className="h-[70px]">
          <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between">
            {/* Logo */}
            <div className="w-[10%]">
              <img
                src="/assets/bclc-logo.png"
                alt="BCLC Logo"
                className="h-8 cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>

            {/* Navigation */}
            <div className="flex-[55%] flex justify-center">
              <div className="flex items-center">
                {navItems.map(({ path, label, icon: Icon }, idx) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => `
                      flex flex-col items-center px-7 10 py-2.5 relative text-[#000000]
                      hover:bg-[#f0f3f5] hover:text-primary 
                      ${isActive
                        ? 'text-primary after:absolute after:bottom-[-3px] after:left-0 after:w-full after:h-[3px] after:bg-primary bg-[#f0f3f5]'
                        : 'hover:after:absolute hover:after:bottom-[-3px] hover:after:left-0 hover:after:w-full hover:after:h-[3px] hover:after:bg-primary'
                      }
                    `}
                  >
                    <Icon className="w-[24px] h-[24px] mb-1" />
                    <span className="text-[14px] font-medium">{label}</span>
                  </NavLink>
                ))}

                {externalItems.map(({ path, label, icon: Icon }) => (
                  <button
                    key={path}
                    onClick={() => openExternalLink(path)}
                    className="relative flex flex-col items-center px-7 py-2.5 text-[#000000] hover:bg-[#f0f3f5] hover:text-primary group"
                  >
                    <Icon className="w-[24px] h-[24px] mb-1" />
                    <span className="text-[14px] font-medium flex items-center gap-1">
                      {label}
                      <ExternalLink className="w-3 h-3 text-primary" />
                    </span>
                    <div className="absolute bottom-[-3px] left-0 w-full h-0 group-hover:h-[3px] bg-primary"></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Profile */}
            <div className="flex justify-left items-center gap-5">
              <Locations />
              <Profile />
            </div>
          </div>
        </nav>
      </header>
      <main className="bg-[#F8FAFC]">
        {/* Main content will be rendered here */}
      </main>
    </>
  );
};