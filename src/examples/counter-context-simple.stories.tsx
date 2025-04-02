import { Meta } from "@storybook/react";
import { RefObject, useEffect } from "react";
import { createStore } from "zustand";
import { createProviderState } from "../zustand-refined";

const meta: Meta = {};
export default meta;

const [useCounter, useCounterActions, CounterProvider] = createProviderState({
  store: (props: RefObject<{ initialCount?: number }>) =>
    createStore(() => props.current.initialCount ?? 0),
  hooks: (useStore) => () => useStore(),
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
export function App() {
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
