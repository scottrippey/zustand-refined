import { createStore } from "zustand";
import { createLocalStore } from "../zustand-actions-2";

type CounterProps = { initialCount?: number; incrementBy?: number };
export const counter = createLocalStore({
  store(props: CounterProps) {
    return createStore((set, get) => ({
      count: props.initialCount ?? 0,
    }));
  },
  actions(setState, getState, props) {
    return {
      increment() {
        setState((curr) => ({
          count: curr.count + (props.incrementBy ?? 1),
        }));
      },
    };
  },
  hooks(useStore, useActions, Provider) {
    return {
      useActions,
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
  const countActions = counterHooks.useActions();
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

export function Example() {
  return (
    <>
      <CounterProvider initialCount={50}>
        Counter (initialCount = 50)
        <CountDisplay />
        <IncrementButton />
      </CounterProvider>
      <CounterProvider incrementBy={10}>
        Counter (incrementBy = 10)
        <CountDisplay />
        <IncrementButton />
      </CounterProvider>
    </>
  );
}
