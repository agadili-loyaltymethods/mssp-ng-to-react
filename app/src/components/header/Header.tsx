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

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const tokenDetailsHelper = useTokenDetailsHelper();

  const openExternalLink = (path: string, query: string = '') => {
    tokenDetailsHelper.openExternalLink(path, query);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/rewards', label: 'Rewards', icon: Gift },
    { path: '/purchase-history', label: 'Activity History', icon: History },
  ];

  const externalItems = [
    { path: 'hotel-booking', label: 'Hotel Booking', icon: Hotel },
    { path: 'casino', label: 'Casino', icon: Casino },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E7E4]">
        <nav className="h-[70px]">
          <div className="max-w-[1440px] mx-auto px-5 h-full flex items-center justify-between">
            {/* Logo */}
            <div className="w-[15%]">
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
                {navItems.map(({ path, label, icon: Icon }) => (
                  <NavLink 
                    key={path}
                    to={path}
                    className={({ isActive }) => `
                      flex flex-col items-center px-7 py-2.5 relative
                      hover:bg-[#f0f3f5] hover:text-primary
                      ${isActive 
                        ? 'text-primary after:absolute after:bottom-[-3px] after:left-0 after:w-full after:h-[3px] after:bg-primary' 
                        : 'text-[#475467] hover:after:absolute hover:after:bottom-[-3px] hover:after:left-0 hover:after:w-full hover:after:h-[3px] hover:after:bg-primary'
                      }
                    `}
                  >
                    <Icon className="w-[22px] h-[22px] mb-1" />
                    <span className="text-[13px] font-medium">{label}</span>
                  </NavLink>
                ))}

                {externalItems.map(({ path, label, icon: Icon }) => (
                  <button 
                    key={path}
                    onClick={() => openExternalLink(path)}
                    className="flex flex-col items-center px-7 py-2.5 text-[#475467] hover:bg-[#f0f3f5] hover:text-primary hover:after:absolute hover:after:bottom-[-3px] hover:after:w-[auto] hover:after:h-[3px] hover:after:bg-primary"
                  >
                    <Icon className="w-[22px] h-[22px] mb-1" />
                    <span className="text-[13px] font-medium flex items-center gap-1">
                      {label}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Profile */}
            <div className="flex-[30%] flex justify-end items-center gap-10">
              <Locations />
              <Profile />
            </div>
          </div>
        </nav>
      </header>
      <main className="bg-[#F8FAFC] pt-[5px]">
        {/* Main content will be rendered here */}
      </main>
    </>
  );
};