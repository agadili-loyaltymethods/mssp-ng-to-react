
import { ReactNode } from 'react';

interface SectionHeadProps {
  children: ReactNode;
}

export function SectionHead({ children }: SectionHeadProps) {
  return (
    <div className="text-lg font-semibold m-5">{children}</div>
  );
}
