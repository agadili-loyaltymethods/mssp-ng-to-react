import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Locations } from '../locations/Locations';
import { Profile } from '../profile/Profile';
import { useTokenDetailsHelper } from '@/hooks/useTokenDetailHelper';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const tokenDetailsHelper = useTokenDetailsHelper();

  const openExternalLink = (path: string, query: string = '') => {
    tokenDetailsHelper.openExternalLink(path, query);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <nav className="h-[70px] mx-auto px-6 max-w-[1440px]">
        <div className="h-full flex items-center justify-between">
          {/* Left section - Logo */}
          <div className="flex-shrink-0 w-[180px]">
            <img 
              src="/assets/bclc-logo.png"
              alt="BCLC Logo"
              className="h-8 cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>

          {/* Middle section - Navigation */}
          <div className="flex items-center space-x-8">
            <NavLink 
              to="/dashboard"
              className={({ isActive }) => `
                flex flex-col items-center px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors
                ${isActive ? 'text-orange-500 border-b-2 border-orange-500' : ''}
              `}
            >
              <span className="material-icons mb-0.5">dashboard</span>
              <span className="text-sm">Dashboard</span>
            </NavLink>

            <NavLink 
              to="/rewards"
              className={({ isActive }) => `
                flex flex-col items-center px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors
                ${isActive ? 'text-orange-500 border-b-2 border-orange-500' : ''}
              `}
            >
              <span className="material-icons mb-0.5">card_giftcard</span>
              <span className="text-sm">Rewards</span>
            </NavLink>

            <NavLink 
              to="/purchase-history"
              className={({ isActive }) => `
                flex flex-col items-center px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors
                ${isActive ? 'text-orange-500 border-b-2 border-orange-500' : ''}
              `}
            >
              <span className="material-icons mb-0.5">history</span>
              <span className="text-sm">Activity History</span>
            </NavLink>

            <button 
              onClick={() => openExternalLink('hotel-booking')}
              className="flex flex-col items-center px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <span className="material-icons mb-0.5">hotel</span>
              <span className="text-sm flex items-center">
                Hotel Booking
                <span className="material-icons text-sm ml-1">open_in_new</span>
              </span>
            </button>

            <button 
              onClick={() => openExternalLink('casino')}
              className="flex flex-col items-center px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <span className="material-icons mb-0.5">casino</span>
              <span className="text-sm flex items-center">
                Casino
                <span className="material-icons text-sm ml-1">open_in_new</span>
              </span>
            </button>
          </div>

          {/* Right section - Location & Profile */}
          <div className="flex items-center space-x-6">
            <Locations />
            <Profile />
          </div>
        </div>
      </nav>
    </header>
  );
};