import { create } from "zustand/react";

type BearsStore = {
  bears: number;
  increaseBears(): void;
  removeAllBears(): void;
  updateBears(newBears: number): void;
};

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
}));

// There are 3 different ways to read state;
// can you find the problematic one(s)?

export function Bears1() {
  const bears = useBears.getState().bears;
  return <span>{bears}</span>;
}
export function Bears2() {
  const { bears } = useBears();
  return <span>{bears}</span>;
}
export function Bears3() {
  const bears = useBears((s) => s.bears);
  return <span>{bears}</span>;
}

// There are 4 different ways to update state;
// can you find the problematic one(s)?

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
