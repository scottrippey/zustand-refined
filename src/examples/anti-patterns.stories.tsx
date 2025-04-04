import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { create } from "zustand/react";
const meta: Meta = {
  title: "Anti-Patterns",
};
export default meta;

/**
 * ⚠️ Unfortunately, we can't simply infer this from the implementation
 */
type BearsStore = {
  bears: number;
  increaseBears(): void;
  removeAllBears(): void;
  updateBears(newBears: number): void;

  fishes: number;
  increaseFishes(): void;
};

/**
 * This example comes from Zustand's docs:
 */
const useBears = create<BearsStore>()((set) => ({
  bears: 0,
  increaseBears: () =>
    set((state) => ({
      bears: state.bears + 1,
    })),
  removeAllBears: () =>
    set({
      bears: 0,
    }),
  updateBears: (newBears) =>
    set({
      bears: newBears,
    }),

  // This also comes from Zustand docs:
  fishes: 0,
  increaseFishes: () =>
    set((prev) => ({
      fishes: prev.fishes + 1,
    })),
}));

// Zustand provides 3 different ways to read state.
// ⚠️ Most of them are problematic!  Can you spot which ones?

export function Bears1() {
  const [, rerender] = useState<any>(null);
  const rerenderButton = <button onClick={rerender}>Unrelated Rerender</button>;

  const bears = useBears.getState().bears;
  return (
    <div>
      Bears: {bears} <StoryButtons /> {rerenderButton}
    </div>
  );
}

export function Bears2() {
  const { bears } = useBears();
  return (
    <div>
      Bears: {bears} <StoryButtons />
    </div>
  );
}
export function Bears3() {
  const bears = useBears((s) => s.bears);
  return (
    <div>
      Bears: {bears} <StoryButtons />
    </div>
  );
}

// There are 4 different ways to update state.
// ⚠️ Most of them are problematic!  Can you spot which ones?

export function IncreaseBears1() {
  const increaseBears = () =>
    useBears.setState((s) => ({ bears: s.bears + 1 }));
  return <button onClick={increaseBears}>More Bears!</button>;
}
export function IncreaseBears2() {
  const increaseBears = useBears.getState().increaseBears;
  return <button onClick={increaseBears}>More Bears!</button>;
}
export function IncreaseBears3() {
  const { increaseBears } = useBears();
  return <button onClick={increaseBears}>More Bears!</button>;
}
export function IncreaseBears4() {
  const increaseBears = useBears((s) => s.increaseBears);
  return <button onClick={increaseBears}>More Bears!</button>;
}

const actions = useBears.getState();
export function StoryButtons() {
  return (
    <>
      <button onClick={actions.increaseBears}>More Bears</button>{" "}
      <button onClick={actions.increaseFishes}>More Fish</button>
    </>
  );
}
