
import { useEffect } from 'react';
import { Subscription } from 'rxjs';

export function useUnsubscribe(subscriptions: Subscription[]) {
  useEffect(() => {
    return () => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [subscriptions]);
}
