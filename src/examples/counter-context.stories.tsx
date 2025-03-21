import React, { useEffect } from "react";
import { createStore } from "zustand";
import { createProviderState } from "../zustand-refined";

type CounterProps = { initialCount?: number; incrementBy?: number };
export const [counterHooks, useCounterActions, CounterProvider] =
  createProviderState({
    store(props: CounterProps) {
      return createStore(() => ({
        count: props.initialCount ?? 0,
      }));
    },
    actions(setState, _getState, props) {
      return {
        increment() {
          setState((curr) => ({
            count: curr.count + (props.incrementBy ?? 1),
          }));
        },
      };
    },
    hooks(useStore) {
      return {
        useCount: () => useStore((s) => s.count),
      };
    },
  });

// UI Demo:

function CountDisplay() {
  const count = counterHooks.useCount();
  return (
    <span>
      Count: <strong>{count}</strong>
    </span>
  );
}
function IncrementButton() {
  counterHooks.useCount();
  const countActions = useCounterActions();
  return (
    <button
      onClick={() => {
        countActions.increment();
      }}
    >
      Increment
    </button>
  );
}

function useIncrementingTimer(interval: number) {
  const countActions = useCounterActions();

  useEffect(() => {
    const t = setInterval(() => countActions.increment(), interval);
    return () => clearInterval(t);
  }, [countActions, interval]);
}
function UseIncrementingTimer(props: { interval: number }) {
  useIncrementingTimer(props.interval);
  return null;
}

export function Example() {
  return (
    <>
      <CounterProvider initialCount={50}>
        Counter (initialCount = 50)
        <UseIncrementingTimer interval={1000} />
        <CountDisplay />
        <IncrementButton />
      </CounterProvider>
      <CounterProvider incrementBy={10}>
        Counter (incrementBy = 10)
        <UseIncrementingTimer interval={5000} />
        <CountDisplay />
        <IncrementButton />
      </CounterProvider>
    </>
  );
}
