import {
  createContext,
  useContext,
  FC,
  PropsWithChildren,
  useRef,
} from "react";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import { shallow } from "zustand/vanilla/shallow";

/**
 * Creates a global (singleton) state.
 *
 * This enforces best practices within Zustand,
 * and ensures top performance within your application.
 *
 * @returns a tuple with 2 items:
 * - The Hooks returned by `hooks`
 * - The Actions returned by `actions`
 *
 * @example
 * export const [ todoHooks, todoActions ] = createGlobalState({
 *   store: () => createStore(() => ({
 *     todos: [] as TodoItem[]
 *   })),
 *   hooks: (useStore) => ({
 *     useCompleted: () => useStore(useShallow(s => s.todos.filter(t => t.completed))),
 *     useIncomplete: () => useStore(useShallow(s => s.todos.filter(t => !t.completed))),
 *     useTodos: () => useStore(s => s.todos),
 *   }),
 *   actions: (setState) => ({
 *     add(item: TodoItem) {
 *       setState(prev => ({
 *         todos: [...prev.todos, item]
 *       }));
 *     },
 *     toggleCompleted(item: TodoItem) {
 *       setState(prev => ({
 *         todos: prev.todos.map(t => {
 *           return (t !== item) ? t : { ...t, completed: !t.completed };
 *         }),
 *       }));
 *     },
 *   }),
 * });
 */
export function createGlobalState<
  TStore extends GenericStoreApi,
  THooks,
  TActions,
>(config: {
  /**
   * Creates a Zustand store with the initial state
   */
  store: () => TStore;
  /**
   * This function allows you to customize
   * what hooks you expose externally.
   *
   * By default, the Zustand hook exposes your entire state object (with an optional `selector`).
   * Instead, this lets you return individual hooks, for exposing specific parts of the state.
   *
   * @param useStore - The default Zustand hook, which
   *                   allows you to access the state
   *                   using an optional `selector` function.
   */
  hooks: (useStore: UseBoundStore<TStore>) => THooks;
  /**
   * Return an "actions" object, with methods for updating the state.
   *
   * With a global store, all actions are static and operate on the global state,
   * so you do not need to use any hooks to access them.
   *
   * @param setState - Use this function to partially update the state.
   *                   All values are merged into the existing state.
   * @param getState - This is not typically needed;
   *                   usually you should use the callback version of
   *                   `setState` to access the previous state.
   */
  actions: (
    setState: TStore["setState"],
    getState: TStore["getState"],
  ) => TActions;
}): [THooks, TActions] {
  // Create the store:
  const store = config.store();
  // Create the actions:
  const actions = config.actions(store.setState, store.getState);

  // Create the default Zustand hook:
  const useBoundStore = ((selector) =>
    useStore(store, selector)) as UseBoundStore<TStore>;
  // Create the custom hooks:
  const hooks = config.hooks(useBoundStore);

  return [hooks, actions] as const;
}

/**
 * Creates Context-based states.
 *
 * This enforces best practices within Zustand,
 * and ensures top performance within your application.
 *
 * `createProviderState` differs from `createGlobalState` in 3 ways:
 * - The `StoreProvider` can create multiple isolated stores; there is no global store
 * - You can pass props to the `StoreProvider`, which can be used when creating the store or performing actions
 * - The "actions" must be accessed by a hook - it is not a static object
 *
 * @returns a tuple with 3 items:
 * - The hooks returned by `hooks`
 * - A `ActionsHook` for the Actions returned by `actions`
 * - A `StoreProvider` for creating the isolated stores in your React application
 *
 */
export function createProviderState<
  TStore extends GenericStoreApi,
  THooks,
  TActions,
  TProps extends PropsWithoutChildren = {},
>(config: {
  /**
   * Returns a Zustand store with the initial state.
   *
   * This will be called for each StoreProvider you use.
   */
  store: (props: TProps) => TStore;
  /**
   * This function allows you to customize
   * what hooks you expose externally.
   *
   * By default, the Zustand hook exposes your entire state object (with an optional `selector`).
   * Instead, this lets you return individual hooks, for exposing specific parts of the state.
   *
   * @param useStore - The default Zustand hook, which
   *                   allows you to access the state
   *                   using an optional `selector` function.
   * @param useActions - The `useActions` hook is normally returned
   *                     as a top-level export, but it's also passed
   *                     into the hooks function here, in case you
   *                     want to export it along with the other hooks.
   */
  hooks: (
    useStore: UseBoundStore<TStore>,
    useActions: ActionsHook<TActions>,
  ) => THooks;
  /**
   * Return an "actions" object, with methods for updating the state.
   *
   * With this local store, you can only access these actions
   * using the `useActions` hook.
   *
   * @param setState - Use this function to (partially) update the state.
   *                   All values are merged into the existing state.
   * @param getState - This is not typically needed;
   *                   usually you should use the callback version of
   *                   `setState` to access the previous state.
   * @param props - The props that were passed to the `StoreProvider`, if any
   */
  actions: (
    setState: TStore["setState"],
    getState: TStore["getState"],
    props: TProps,
  ) => TActions;
  /**
   * Used for improving "Missing StoreProvider" error messages
   */
  displayName?: string;
}): [THooks, ActionsHook<TActions>, StoreProvider<TProps>] {
  const UNINITIALIZED = Symbol("UNINITIALIZED");

  const storeContext = createContext<TStore | typeof UNINITIALIZED>(
    UNINITIALIZED,
  );
  const actionsContext = createContext<TActions | typeof UNINITIALIZED>(
    UNINITIALIZED,
  );

  // Create the StoreProvider:
  const StoreProvider: StoreProvider<TProps> = ({ children, ..._props }) => {
    const props = _props as TProps; // (only necessary because we omit 'children')

    // Only create the store once:
    const store = useRefMemo(() => config.store(props));

    const actions = useRefMemo(
      () => config.actions(store.setState, store.getState, props),
      // We recreate the `actions` if our `props` change:
      props,
    );

    return (
      <storeContext.Provider value={store}>
        <actionsContext.Provider value={actions}>
          {children}
        </actionsContext.Provider>
      </storeContext.Provider>
    );
  };

  // Create the useActions hook:
  const useActions = () => {
    const actions = useContext(actionsContext);
    if (actions === UNINITIALIZED) {
      throw new Error(`Missing '${config.displayName || "StoreProvider"}'`);
    }
    return actions;
  };

  // Create the default Zustand hook:
  const useBoundStore = ((selector) => {
    const store = useContext(storeContext);
    if (store === UNINITIALIZED) {
      throw new Error(`Missing '${config.displayName || "StoreProvider"}'`);
    }
    return selector ? useStore(store, selector) : useStore(store);
  }) as UseBoundStore<TStore>;

  // Create the custom hooks:
  const hooks = config.hooks(useBoundStore, useActions);

  return [hooks, useActions, StoreProvider] as const;
}

/**
 * Same as `useMemo`, except:
 * - Uses a `Ref`, to guarantee reference stability (`useMemo` has no guarantee)
 * - Allows `deps` to be anything; objects and arrays get shallow-compared
 */
export function useRefMemo<T>(factory: () => T, deps?: unknown): T {
  const ref = useRef<null | { deps: unknown; value: T }>(null);
  if (!ref.current || !shallow(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory(),
    };
  }
  return ref.current.value;
}

export type StoreProvider<TProps> = FC<PropsWithChildren<TProps>>;
export type ActionsHook<TActions> = () => TActions;

/**
 * Same as Zustand's `StoreApi` type,
 * but with a more generic version of `setState`,
 * which allows for middleware to modify the signature (e.g. `devtools`).
 */
export type GenericStoreApi<TState = any> = Override<
  StoreApi<TState>,
  { setState: (...args: any[]) => void }
>;
type Override<T, TOverrides> = Omit<T, keyof TOverrides> & TOverrides;
export type PropsWithoutChildren = {
  children?: never;
  [prop: string]: unknown;
};
