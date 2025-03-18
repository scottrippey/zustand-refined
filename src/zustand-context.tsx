import { createContext, useContext, useMemo } from "react";
import { createStore, useStore } from "zustand/index";
import { GetState, SetState, UseStoreHook } from "./zustand-actions";

export function createStoreWithActions<TProps, TState, TActions>(
  getInitialState: (props?: TProps) => TState,
  getActions: (
    setState: SetState<TState>,
    getState: GetState<TState>,
    props?: TProps,
  ) => TActions,
) {
  const createStoreAndActions = (props: TProps | undefined) => {
    const store = createStore(() => getInitialState(props));
    const actions = getActions(store.setState, store.getState, props);
    return { store, actions };
  };
  // Create the global store, and use it as the default:
  const globalStore = createStoreAndActions(undefined);
  const storeContext = createContext(globalStore.store);
  const storeActionsContext = createContext(globalStore.actions);

  /**
   * This provider creates a "local store",
   * instead of using the global store.
   *
   * @example
   * <StoreProvider>
   *
   * </StoreProvider>
   */
  const StoreProvider = (props: React.PropsWithChildren<TProps>) => {
    const { store, actions } = useMemo(
      () => createStoreAndActions(props),
      // dependencies:
      Object.values(props),
    );

    return (
      <storeContext.Provider value={store}>
        <storeActionsContext.Provider value={actions}>
          {props.children}
        </storeActionsContext.Provider>
      </storeContext.Provider>
    );
  };

  const useStoreHook = ((selector) => {
    const store = useContext(storeContext);
    return selector ? useStore(store, selector) : useStore(store);
  }) as UseStoreHook<TState>;

  const useActionsHook = () => {
    const actions = useContext(storeActionsContext);
    return actions;
  };

  return [useStoreHook, useActionsHook, StoreProvider] as const;
}
