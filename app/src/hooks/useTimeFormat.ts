import { useEffect, useRef } from 'react';

export const useTimeFormat = (text: string) => {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      const formattedTime = `${text.substr(0,5)}<small class="text-small">${text.substr(5,2)}</small>`;
      elementRef.current.innerHTML = formattedTime;
    }
  }, [text]);

  return elementRef;
};
