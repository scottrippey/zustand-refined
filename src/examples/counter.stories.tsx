import { useEffect } from "react";
import { createGlobalStateWithActions } from "../zustand-actions";

const [useCounter, counterActions] = createGlobalStateWithActions(
  {
    count: 0,
  },
  (setState, getState) => ({
    increment() {
      setState((old) => ({ count: old.count + 1 }));
    },
  }),
);

/**
 * This component reads the state
 */
function CounterDisplay() {
  const c = useCounter((c) => c.count);
  return (
    <span>
      Count: <strong>{c}</strong>
    </span>
  );
}

/**
 * This component sets the state
 */
function IncrementButton() {
  return <button onClick={() => counterActions.increment()}>Increment</button>;
}

/**
 * This component increments on a timer
 */
function useIncrementTimer() {
  useEffect(() => {
    const t = setInterval(() => counterActions.increment(), 1000);
    return () => clearInterval(t);
  }, []);
}

export function App() {
  useIncrementTimer();
  return (
    <>
      <CounterDisplay />
      <IncrementButton />
    </>
  );
}
