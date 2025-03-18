import { useEffect } from "react";
import { createGlobalStateWithActions } from "../zustand-actions";

const [useCounter, counterActions] = createGlobalStateWithActions(
  0,
  (setState) => ({
    increment() {
      setState((current) => current + 1);
    },
  }),
);

/**
 * This component reads the state
 */
function Counter() {
  const count = useCounter();
  return (
    <span>
      Count: <strong>{count}</strong>
    </span>
  );
}

/**
 * This component sets the state
 */
function IncrementButton() {
  return (
    <button
      onClick={() => {
        counterActions.increment();
      }}
    >
      Increment
    </button>
  );
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

function App() {
  useIncrementTimer();
  return (
    <>
      <Counter />
      <IncrementButton />
    </>
  );
}
