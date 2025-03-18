import { createStore, useStore } from "zustand";

/**
 * Zustand best-practices:
 *
 * - Use hooks for getting state
 * - Always use a selector
 * - Use static methods for all mutations (aka "actions")
 */

type HookSelector<TState> = (
  ...args: unknown[]
) => <TSelected>(state: TState) => TSelected;

/**
 *
 *
 */
export function createGlobalStateWithActions<
  TState,
  TActions,
  THooks extends Record<string, HookSelector<TState>>,
>(stateConfig: {
  initialState: TState;
  actions: (
    setState: NoInfer<SetState<TState>>,
    getState: NoInfer<GetState<TState>>,
  ) => TActions;
  selectors: THooks;
}) {
  // Create the Zustand store, with initial state:
  const store = createStore<TState>(() => initialState);
  // Create the actions:
  const actions = actionsInitializer(store.setState, store.getState);

  // Create the hooks:
  const useStoreHook = ((selector) => {
    return selector ? useStore(store, selector) : useStore(store);
  }) as UseStoreHook<TState>;

  return [Object.assign(useStoreHook, extraHooks), actions] as const;
}

/**
 * This hook provides read-only access to the state.
 */
export type UseStoreHook<TState> = {
  /**
   * Returns the current state.
   *
   * Note: All state changes will trigger a rerender.
   * If you only need a subset of the current state,
   * pass in a selector.
   */
  (): TState;

  /**
   * Returns a selection of the current state.
   *
   * Only rerenders when the selected value changes.
   */
  <TSelected>(selector: (state: TState) => TSelected): TSelected;
};

/**
 * Updates the current state
 */
export type SetState<TState> = {
  /**
   * Merges the partial state into the new state.
   */
  (partial: Partial<TState>): void;
  /**
   * Merges the partial state into the new state.
   *
   * This callback provides the current state.
   */
  (partial: (currentState: TState) => Partial<TState>): void;
};
/**
 * Returns the current state
 */
export type GetState<TState> = () => TState;
