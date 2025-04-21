import React, { useEffect, useState } from 'react';

interface AppTimerProps {
  startedAt: string;
  timeLimit: number;
}

export const AppTimer: React.FC<AppTimerProps> = ({ startedAt, timeLimit }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('00:00:00');

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    const startTimer = () => {
      if (startedAt && timeLimit > 0) {
        const startTime = new Date(startedAt).getTime();
        const endTime = startTime + timeLimit * 60 * 1000;

        timerInterval = setInterval(() => {
          const currentTime = Date.now();
          const timeDiff = Math.max(0, endTime - currentTime);

          if (timeDiff <= 0) {
            setTimeRemaining('00:00:00');
            clearInterval(timerInterval);
          } else {
            setTimeRemaining(formatTimeRemaining(timeDiff));
          }
        }, 1000);
      } else {
        setTimeRemaining('00:00:00');
      }
    };

    startTimer();

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [startedAt, timeLimit]);

  const formatTimeRemaining = (timeInMs: number): string => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return days > 0 
      ? `${days} day(s) ${hours}h : ${minutes}m : ${seconds}s` 
      : `${hours}h : ${minutes}m : ${seconds}s`;
  };

  return <b>{timeRemaining}</b>;
};