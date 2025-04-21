
import { RouteObject } from 'react-router-dom';
import { Dashboard } from './components/dashboard/Dashboard';
import { Purchase } from './components/purchase/Purchase';
import { Rewards } from './components/rewards/Rewards';
import { PurchaseHistory } from './components/purchase-history/PurchaseHistory';
import { Checkout } from './components/checkout/Checkout';
import { PurchaseConfirmation } from './components/purchase-confirmation/PurchaseConfirmation';
import { PageNotFound } from './components/page-not-found/PageNotFound';
import { RequireAuth } from './components/auth/RequireAuth';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'purchase', element: <Purchase /> },
      { path: 'rewards', element: <Rewards /> },
      { path: 'purchase-history', element: <PurchaseHistory /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'purchase-confirmation', element: <PurchaseConfirmation /> },
    ]
  },
  { path: 'page-not-found', element: <PageNotFound /> },
  { path: '*', element: <PageNotFound /> }
];
