import { useEffect } from "react";
import { createStore } from "zustand";
import { createGlobalState, createStateWithProvider } from "../zustand-actions";

const [useCounter, useCounterActions, CounterProvider] =
  createStateWithProvider({
    store: (props: { initialCount?: number }) =>
      createStore(() => props.initialCount ?? 0),
    actions: (setState) => ({
      increment() {
        setState((current) => current + 1);
      },
    }),
  });

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
  const counterActions = useCounterActions();
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
  const counterActions = useCounterActions();
  useEffect(() => {
    const t = setInterval(() => counterActions.increment(), 1000);
    return () => clearInterval(t);
  }, [counterActions]);
}

function CounterWidget() {
  useIncrementTimer();
  return (
    <>
      <Counter />
      <IncrementButton />
    </>
  );
}
function App() {
  return (
    <>
      <CounterProvider>
        <CounterWidget />
      </CounterProvider>
      <CounterProvider initialCount={50}>
        <CounterWidget />
      </CounterProvider>
    </>
  );
}
