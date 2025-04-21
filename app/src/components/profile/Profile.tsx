
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Menu,
  MenuItem,
  IconButton,
  TextField,
  Button 
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
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
    <div className="flex flex-row items-center gap-1">
      <AccountCircle className="text-3xl" />
      <div className="flex flex-col items-start">
        <p className="m-0">
          {memberInfo?.firstName} {memberInfo?.lastName}
        </p>
        <div className="flex">
          <h5 
            className="cursor-pointer m-0"
            onClick={handleMenuOpen}
          >
            {memberInfo?.tiers?.[0]?.level?.name} | {totalPoints.toLocaleString()}
            <IconButton className="w-7 h-6 p-0 hide-ripple" color="primary">
              <span className="material-icons">expand_more</span>
            </IconButton>
          </h5>
        </div>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <div className="flex flex-col items-center p-2.5">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="flex flex-col items-center gap-2.5 pb-5"
          >
            <TextField
              label="Switch Member"
              value={loyaltyId}
              onChange={(e) => setLoyaltyId(e.target.value)}
              variant="outlined"
              disabled={isFetching}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleSwitchMember}
                    disabled={isFetching}
                    color="primary"
                    title="Click to Switch Member"
                  >
                    <span className="material-icons">person_search</span>
                  </IconButton>
                ),
              }}
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogout}
            fullWidth
          >
            Logout
          </Button>
        </div>
      </Menu>
    </div>
  );
};
