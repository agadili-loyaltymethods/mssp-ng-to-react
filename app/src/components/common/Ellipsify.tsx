import React, { useEffect, useRef } from 'react';

interface EllipsifyProps {
  children: string;
  className?: string;
}

export const Ellipsify: React.FC<EllipsifyProps> = ({ children, className }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const element = elementRef.current;
      if (element && element.textContent) {
        if (element.offsetWidth < element.scrollWidth) {
          element.setAttribute('data-title', element.textContent);
        } else {
          element.removeAttribute('data-title');
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [children]);

  return (
    <div 
      ref={elementRef} 
      className={`ellipsify ${className || ''}`}
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      {children}
    </div>
  );
};
