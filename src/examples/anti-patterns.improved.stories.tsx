import { createStore } from "zustand";
import { createGlobalState } from "../zustand-refined";

const [{ useBears }, bearsActions] = createGlobalState({
  store: () =>
    createStore(() => ({
      bears: 0,
    })),
  hooks: (useStore) => ({
    // Do not expose any "selector" logic; just export a simple `useBears()` hook
    useBears: () => useStore((s) => s.bears),
  }),
  actions: (setState) => ({
    // Actions are not part of the state, they're kept separate:
    increaseBears: () => setState((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => setState({ bears: 0 }),
    updateBears: (newBears: number) => setState({ bears: newBears }),
  }),
});

function Bears() {
  // 💚 There's no need use selectors here:
  const bears = useBears();
  return <span>{bears}</span>;
}
function IncreaseBears() {
  // 💚 No need for any hooks; these global actions are defined outside the React lifecycle
  return <button onClick={bearsActions.increaseBears}>More Bears!</button>;
}
