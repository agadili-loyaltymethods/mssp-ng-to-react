import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, MenuItem, TextField } from '@mui/material';
import { UserCircle, ChevronDown, Search, LogOut } from 'lucide-react';
import { useMemberService } from '../../hooks/useMemberService';
import { useAuthService } from '../../hooks/useAuthService';
import { addMember, clearMember } from '../../redux/slices/memberSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import useAlertService from '@/hooks/useAlertService';

export const Profile: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [loyaltyId, setLoyaltyId] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);

  const memberInfo = useSelector((state: any) => state.member);
  const dispatch = useDispatch();
  const memberService = useMemberService();
  const alertService = useAlertService();
  const authService = useAuthService();

  useEffect(() => {
    if (memberInfo?.purses) {
      setLoyaltyId(memberInfo.loyaltyId);
      setTotalPoints(
        memberInfo.purses.find((x: any) => x.name === 'Anywhere Points')?.availBalance ?? 0
      );
    }
  }, [memberInfo]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchMember = async () => {
    const oldVal = localStorage.getItem('loyaltyId');
    
    if (loyaltyId) {
      setIsFetching(true);
      try {
        const member = await memberService.getMember(loyaltyId);
        dispatch(addMember({ member }));
        localStorage.setItem('loyaltyId', loyaltyId);
        handleMenuClose();
      } catch (error: any) {
        localStorage.setItem('loyaltyId', oldVal || '');
        setLoyaltyId(oldVal || '');
        alertService.errorAlert(error?.error?.error || error?.message);
      } finally {
        setIsFetching(false);
      }
    }
  };

  const handleLogout = () => {
    dispatch(clearMember());
    dispatch(clearCart());
    authService.logout();
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleMenuOpen}
        className="flex items-center gap-2 text-[#475467] hover:bg-[#FFF7ED] hover:text-primary px-2 py-1.5 rounded-md"
      >
        <UserCircle className="w-[22px] h-[22px]" />
        <div className="flex flex-col items-start">
          <span className="text-[14px] font-medium leading-5">
            {memberInfo?.firstName} {memberInfo?.lastName}
          </span>
          <span className="text-[12px] text-[#667085] leading-4">
            {memberInfo?.tiers?.[0]?.level?.name} | {totalPoints.toLocaleString()}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 ml-1" />
      </button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          className: 'mt-2 p-2 min-w-[300px]',
          elevation: 3,
          sx: {
            '& .MuiMenuItem-root': {
              fontSize: '14px',
              color: '#475467',
              '&:hover': {
                backgroundColor: '#FFF7ED',
              },
            },
          },
        }}
      >
        <div className="p-3">
          <TextField
            fullWidth
            size="small"
            label="Switch Member"
            value={loyaltyId}
            onChange={(e) => setLoyaltyId(e.target.value)}
            disabled={isFetching}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#E8E7E4',
                },
                '&:hover fieldset': {
                  borderColor: '#D0D5DD',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#e86a10',
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: '14px',
                color: '#475467',
              },
              '& .MuiInputBase-input': {
                fontSize: '14px',
                color: '#475467',
              },
            }}
            InputProps={{
              endAdornment: (
                <Search
                  className="w-5 h-5 text-[#475467] cursor-pointer hover:text-primary"
                  onClick={handleSwitchMember}
                />
              ),
            }}
          />
        </div>
        
        <MenuItem 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </MenuItem>
      </Menu>
    </div>
  );
};