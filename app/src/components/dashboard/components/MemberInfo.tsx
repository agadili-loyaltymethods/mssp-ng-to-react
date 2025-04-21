import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Card } from '@mui/material';

export const MemberInfo: React.FC = () => {
  const memberInfo = useSelector((state: RootState) => state.member);

  return (
    <Card className="p-20 card-style flex-[25%]">
      <div className="welcome-section">
        <div className="user-header">
          <div className="user-welcome">
            <h2 className="welcome-text">Welcome back,</h2>
            <h1 className="user-name">{memberInfo?.firstName} {memberInfo?.lastName}</h1>
          </div>
        </div>
        <div className="user-details">
          <div className="detail-item flex flex-row items-center">
            <span className="material-icons">badge</span>
            <span>
              <small className="label">Loyalty ID</small>
              <div className="value">{memberInfo?.loyaltyId}</div>
            </span>
          </div>
          <div className="detail-item flex flex-row items-center">
            <span className="material-icons">email</span>
            <span>
              <small className="label">Email</small>
              <div className="value">{memberInfo?.email || '-'}</div>
            </span>
          </div>
          <div className="detail-item flex flex-row items-center">
            <span className="material-icons">calendar_today</span>
            <span>
              <small className="label">Member Since</small>
              <div className="value">
                {new Date(memberInfo?.enrollDate).toLocaleDateString()}
              </div>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};