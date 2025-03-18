import { createStore } from "zustand";
import { createStateWithProvider } from "../zustand-actions";

type CounterProps = { initialCount?: number; incrementBy?: number };
export const [counterHooks, useCounterActions, CounterProvider] =
  createStateWithProvider({
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
