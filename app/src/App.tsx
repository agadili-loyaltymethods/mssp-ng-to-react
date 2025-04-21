```typescript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useMemberService } from './hooks/useMemberService';
import { useAlertService } from './hooks/useAlertService';
import { addMember } from './redux/slices/memberSlice';
import { Header } from './components/header/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { Purchase } from './components/purchase/Purchase';
import { Rewards } from './components/rewards/Rewards';
import { PurchaseHistory } from './components/purchase-history/PurchaseHistory';
import { Checkout } from './components/checkout/Checkout';
import { PurchaseConfirmation } from './components/purchase-confirmation/PurchaseConfirmation';
import { PageNotFound } from './components/page-not-found/PageNotFound';
import './App.css';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const memberService = useMemberService();
  const alertService = useAlertService();
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const loyaltyId = localStorage.getItem('loyaltyId') || '1001';
        const member = await memberService.getMember(loyaltyId);
        dispatch(addMember({ member }));
        localStorage.setItem('loyaltyId', member.loyaltyId);
      } catch (error: any) {
        alertService.errorAlert(error?.error?.error || error?.message);
      }
    };

    initializeApp();
  }, []);

  return (
    <>
      {isAuthenticated && <Header />}
      <main className={isAuthenticated ? 'adjust-header-height' : ''}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/purchase-confirmation" element={<PurchaseConfirmation />} />
          <Route path="/page-not-found" element={<PageNotFound />} />
          <Route path="*" element={<Navigate to="/page-not-found" replace />} />
        </Routes>
      </main>
    </>
  );
};
```