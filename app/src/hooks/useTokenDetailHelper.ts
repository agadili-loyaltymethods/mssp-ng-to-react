import { useSelector } from 'react-redux';

type AppState = {
    location: {
      location: string;
    };
  };

export const useTokenDetailsHelper = () => {
  // Adjust this based on your state shape
  const location = useSelector((state: AppState) => state.location.location);

  const openExternalLink = (path: string, query: string = '') => {
    const msspUrl = 'http://localhost:3001';
    const loyaltyID = localStorage.getItem('loyaltyId');

    let targetUrl = `${msspUrl}/${path}`;
    const params = new URLSearchParams();

    if (loyaltyID) {
      params.append('loyaltyId', loyaltyID);
    }

    if (location) {
      params.append('location', location);
    }

    if (query) {
      params.append('coupon', btoa(query));
    }

    if (params.toString()) {
      targetUrl += `?${params.toString()}`;
    }

    window.open(targetUrl, '_blank');
  };

  return { openExternalLink };
};
