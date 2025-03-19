import { useEffect } from "react";
import { createStore } from "zustand";
import { devtools } from "zustand/middleware/devtools";
import { immer } from "zustand/middleware/immer";
import { createGlobalState } from "../zustand-actions";

export const [useCount, counterActions] = createGlobalState({
  store: () =>
    createStore(
      devtools(
        immer(() => ({
          count: 0,
        })),
      ),
    ),
  hooks: (useStore) => () => useStore((s) => s.count),
  actions: (setState) => ({
    increment(amount = 1) {
      setState(
        (curr) => {
          // This syntax is supported due to `immer` middleware:
          curr.count += amount;
        },
        false,
        // This 3rd parameter is used by `devtools` middleware:
        { type: "count/increment" },
      );
    },
  }),
});

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
function CountDisplay() {
  const count = useCount();
  return (
    <label>
      Count: <strong>{count}</strong>
    </label>
  );
}
function useAutoIncrement() {
  useEffect(() => {
    const t = setInterval(() => counterActions.increment(), 1000);
    return () => clearInterval(t);
  }, []);
}

function App() {
  useAutoIncrement();
  return (
    <>
      <CountDisplay />
      <IncrementButton />
    </>
  );
}
