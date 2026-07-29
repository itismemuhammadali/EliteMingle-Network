import { useState, useEffect, useCallback } from 'react';

export function useCountdown(initialSeconds: number) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const reset = useCallback(() => {
    setSecondsRemaining(initialSeconds);
    setCanResend(false);
  }, [initialSeconds]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    secondsRemaining,
    canResend,
    reset,
    formatTime,
  };
}
