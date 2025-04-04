import { Meta } from "@storybook/react";
const meta: Meta = {
  title: "Anti-Patterns (Fixed)",
};
export default meta;

import { createStore } from "zustand";
import { createGlobalState } from "../zustand-refined";

const [{ useBears, useFishes }, bearsActions] = createGlobalState({
  store: () =>
    createStore(() => ({
      bears: 0,
      fishes: 0,
    })),
  hooks: (useStore) => ({
    // Do not expose any "selector" logic; just export a simple `useBears()` hook
    useBears: () => useStore((s) => s.bears),
    useFishes: () => useStore((s) => s.fishes),
  }),
  actions: (setState) => ({
    // Actions are not part of the state, they're kept separate:
    increaseBears: () => setState((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => setState({ bears: 0 }),
    updateBears: (newBears: number) => setState({ bears: newBears }),
    increaseFish: () => setState((state) => ({ fishes: state.fishes + 1 })),
  }),
});

function Bears5() {
  // 💚 There's no need use selectors here:
  const bears = useBears();
  return <span>Bears: {bears}</span>;
}
function Fishes() {
  const fish = useFishes();
  return <span>Fish: {fish}</span>;
}

function IncreaseBears5() {
  // 💚 No need for any hooks; these global actions are defined outside the React lifecycle
  return <button onClick={bearsActions.increaseBears}>More Bears!</button>;
}
function IncreaseFish() {
  return <button onClick={bearsActions.increaseFish}>More Fish!</button>;
}

export function NoAntiPatternsHere() {
  return (
    <section>
      <Bears5 /> <Fishes /> <IncreaseBears5 /> <IncreaseFish />
    </section>
  );
}
