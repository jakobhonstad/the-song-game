import React from 'react';

interface State {
  seconds: number;
}

interface UseTimerOptions {
  initialSeconds?: number;
  isActive?: boolean;
  resetKey?: string | number | null;
}

export function useTimer({ initialSeconds = 30, isActive = true, resetKey = null }: UseTimerOptions): number {
  const [state, setState] = React.useState<State>({ seconds: initialSeconds });

  React.useEffect(() => {
    setState({ seconds: initialSeconds });
  }, [initialSeconds, resetKey]);

  React.useEffect(() => {
    if (!isActive || state.seconds <= 0) return;

    const interval = setInterval(() => {
      setState((prev) => ({ seconds: Math.max(prev.seconds - 1, 0) }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, state.seconds]);

  return state.seconds;
}