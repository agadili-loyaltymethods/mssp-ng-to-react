
import { ReactNode } from 'react';

interface NoDataProps {
  children: ReactNode;
}

export function NoData({ children }: NoDataProps) {
  return (
    <p className="text-base">{children}</p>
  );
}
