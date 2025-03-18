import { createStore } from "zustand";
import { devtools } from "zustand/middleware/devtools";
import { immer } from "zustand/middleware/immer";
import { createGlobalStateWithActions } from "../zustand-actions";
import { createGlobalStateWithActionsM } from "../zustand-actions-middleware";

const storePlain = createStore((setState) => ({
  count: 0,
  inc() {
    setState((old) => ({ count: old.count + 1 }));
  },
}));
const storeDevtools = createStore(
  devtools((setState, getState) => ({
    count: 0,
    badIncrement() {
      setState((old) => ({ count: old.count + 1 }), false, "increment");
    },
  })),
);
storePlain.setState(
  ///
  (old) => ({ count: old.count + 1 }),
  false,
  "increment",
);
storeDevtools.setState(
  ///
  (old) => ({ count: old.count + 1 }),
  false,
  "increment",
);

const [useCounter, counterActions] = createGlobalStateWithActionsM(
  ({ setState, getState }) => ({
    state: {
      count: 0,
      incrementBy: 1,
      findStepsTaken() {
        return this.count / this.incrementBy;
        return getState().count + getState().incrementBy;
      },
    },
    actions: {
      increment() {
        setState((state) => ({
          count: state.count + state.incrementBy,
        }));
      },
      speedUp(amount = 1) {
        setState((state) => ({
          incrementBy: state.incrementBy + amount,
        }));
      },
    },
  }),
);

function middleware<T>(cb: T): T {
  return cb;
}
