import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { TvStatic } from './TvStatic';

interface TransitionContextValue {
  navigateWithTransition: (to: string) => void;
}

const TransitionContext = createContext<TransitionContextValue>({
  navigateWithTransition: () => {},
});

export function useTransitionNavigate() {
  return useContext(TransitionContext).navigateWithTransition;
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);
  const [target, setTarget] = useState<string | null>(null);

  const navigateWithTransition = useCallback((to: string) => {
    setTarget(to);
    setTransitioning(true);
  }, []);

  const handleMidpoint = useCallback(() => {
    if (target) {
      navigate(target);
    }
  }, [navigate, target]);

  const handleComplete = useCallback(() => {
    // TvStatic CSS animation handles the fade-out automatically
    // We just need to clean up state after the full duration
  }, []);

  // After the full animation, reset state
  const handleAnimationEnd = useCallback(() => {
    setTimeout(() => {
      setTransitioning(false);
      setTarget(null);
    }, 350); // Let the fade-out finish
  }, []);

  return (
    <TransitionContext.Provider value={{ navigateWithTransition }}>
      {children}
      <TvStatic
        active={transitioning}
        onComplete={() => {
          handleMidpoint();
          handleComplete();
          handleAnimationEnd();
        }}
        duration={600}
      />
    </TransitionContext.Provider>
  );
}
