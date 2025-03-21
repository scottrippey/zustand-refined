import { useEffect } from "react";
import { createStore } from "zustand";
import { createGlobalState } from "../zustand-refined";

const [useCount, counterActions] = createGlobalState({
  store: () =>
    createStore(() => ({
      count: 0,
    })),
  hooks: (useStore) => () => useStore((s) => s.count),
  actions: (setState) => ({
    increment() {
      setState((old) => ({ count: old.count + 1 }));
    },
  }),
});

/**
 * This component reads the state
 */
function CounterDisplay() {
  const c = useCount();
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
