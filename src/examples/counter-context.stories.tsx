import { Meta } from "@storybook/react";
import React, { RefObject, useEffect } from "react";
import { createStore } from "zustand";
import { createProviderState } from "../zustand-refined";

const meta: Meta = {};
export default meta;

type CounterProps = { initialCount?: number; incrementBy?: number };
export const [counterHooks, useCounterActions, CounterProvider] = createProviderState({
  store: (props: RefObject<CounterProps>) =>
    createStore(() => ({
      count: props.current.initialCount ?? 0,
    })),
  actions: (setState, _getState, props) => ({
    increment() {
      setState((curr) => ({
        count: curr.count + (props.current.incrementBy ?? 1),
      }));
    },
  }),
  hooks: (useStore) => ({
    useCount: () => useStore((s) => s.count),
  }),
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
