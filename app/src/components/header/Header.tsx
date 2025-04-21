```typescript
import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTokenDetailsHelper } from '../../hooks/useTokenDetailsHelper';
import { Locations } from '../locations/Locations';
import { Profile } from '../profile/Profile';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const tokenDetailsHelper = useTokenDetailsHelper();

  const openExternalLink = (path: string, query: string = '') => {
    tokenDetailsHelper.openExternalLink(path, query);
  };

  return (
    <header>
      <nav className="h-[70px] bg-white text-black border-b border-[#E8E7E4] p-5 w-full z-[1000]">
        <div className="w-[1440px] flex items-center">
          {/* Left section */}
          <div className="flex-[15%] flex items-center">
            <img 
              className="cursor-pointer w-[75%]" 
              onClick={() => navigate('/')} 
              src="assets/bclc-logo.png" 
              alt="Logo"
            />
          </div>

          {/* Middle section */}
          <div className="flex-[55%] flex items-center">
            <div className="flex items-center text-center">
              <NavLink 
                to="/dashboard"
                className={({ isActive }) => 
                  `flex flex-col items-end p-2.5 px-7 cursor-pointer nav-item
                  ${isActive ? 'router-link-active' : ''}`
                }
              >
                <span className="icon view-dashboard" />
                <label>Dashboard</label>
              </NavLink>

              <NavLink 
                to="/rewards"
                className={({ isActive }) => 
                  `flex flex-col items-end p-2.5 px-7 cursor-pointer nav-item
                  ${isActive ? 'router-link-active' : ''}`
                }
              >
                <span className="icon gift-outline" />
                <label>Rewards</label>
              </NavLink>

              <NavLink 
                to="/purchase-history"
                className={({ isActive }) => 
                  `flex flex-col items-end p-2.5 px-7 cursor-pointer nav-item
                  ${isActive ? 'router-link-active' : ''}`
                }
              >
                <span className="icon history" />
                <label>Activity History</label>
              </NavLink>

              <button 
                onClick={() => openExternalLink('hotel-booking')}
                className="flex flex-col items-end pt-2.5 px-7 cursor-pointer nav-item m-0 pb-1"
              >
                <span className="icon hotel" />
                <label>
                  Hotel Booking 
                  <span className="small-icon text-primary pb-2">open_in_new</span>
                </label>
              </button>

              <button 
                onClick={() => openExternalLink('casino')}
                className="flex flex-col items-end pt-2.5 px-7 cursor-pointer nav-item pb-1"
              >
                <span className="icon casino" />
                <label>
                  Casino 
                  <span className="small-icon text-primary pb-2">open_in_new</span>
                </label>
              </button>
            </div>
          </div>

          {/* Right section */}
          <div className="flex-[30%]">
            <div className="flex justify-between items-center gap-10 right-menu-icons">
              <Locations />
              <Profile />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
```