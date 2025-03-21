# `zustand-refined`

`zustand-refined` makes the best of Zustand, by making it easy to adhere to its **best practices**.

## Zustand Best Practices

`zustand-refined` has a simple API, designed to
avoid several [anti-patterns](#zustand-anti-patterns)
and help achieve these **best practices**:

- **Top Performance**  
  - It should be easy to avoid unnecessary rerendering.
  - Hooks should only subscribe to the actual data they need.
  - Zustand's caching and memoization techniques should be used correctly.
  - Actions should be static, and never cause rerenders.
- **Separation of concerns**  
  - The concepts of defining state, reading state, and updating state should be kept separate.
  - `store` defines your initial **state**
  - `hooks` defines the ways you can **read** state
  - `actions` defines the ways you can **update** state
- **Code Quality**  
  - All Zustand-specific logic should be encapsulated.  This includes middleware, selectors, and caching techniques.
  - The raw state doesn't need to be exposed. Custom hooks should be used for accessing specific parts of state, and should deal with proper caching.
- **Scalability**
  - It should be easy to create both Global stores and Provider-based local stores. 
  - It should be easy to migrate from a Global store to a Provider-based local store.

## Installation

Install both `zustand-refined` and `zustand`:
```sh
npm install --save zustand zustand-refined
```

## Usage Example

### Define your `store`, `hooks`, and `actions`

Here's a classic "To Do" example, using a global state via `createGlobalState(...)`
```ts
import { createStore } from 'zustand';
import { createGlobalState } from 'zustand-refined';

export type TodoItem = { id: string, title: string, complete: boolean };
export const [ todoHooks, todoActions ] = createGlobalState({
  // Define the initial state:
  store: () => createStore(() => ({
    todos: [] as TodoItem[]
  })),
  // 👀 Define hooks for reading the state:
  hooks: (useStore) => ({
    useById: (id: string) => {
      return useStore(s => {
        return s.todos.find(t => t.id === id);
      });
    },
    useByCompleteState: (completed: boolean) => {
      // 👇 Notice how this hook requires `useShallow` for proper caching:
      return useStore(useShallow(s => {
        return s.todos.find(t => t.completed === completed);
      }));
    }
  }),
  // 📝 Define actions for updating the state:
  actions: (setState) => ({
    addTodo(item: TodoItem) {
      setState((state) => ({
        todos: [ ...state.todos, item ]
      }));
    },
    toggleTodo(id: string, complete: boolean) {
      setState((state) => ({
        todos: state.todos.map(
          t => t.id === id ? { ...t, completed } : t
        )
      }))
    },
    deleteTodo(id: string) {
      setState((state) => ({
        todos: state.todos.filter(t => t.id !== id),
      }));
    }
  }),
});
```

In this example, we export 2 objects:

- `todoHooks` is simply the return value of the `hooks` function
- `todoActions` is simply the return value of the `actions` function

### Using hooks and actions:

The `hooks` are standard React hooks, so can be used in components and other hooks.
With global state, the `actions` are simply static functions that can be called anywhere, any time.

```tsx
import { todoHooks, todoActions } from "./todoState";

function TodoItem(props: { id: string }) {
  // 👀 Read the state using a hook:
  const item = todoHooks.useById(props.id);
  return (
    <label>
      <input 
        type="checkbox"
        checked={item.complete}
        onChange={(ev) => {
          // 📝 Update the state using an action:
          todoActions.toggleCompleted(id, ev.currentTarget.checked);
        }}
      />
      {item.title}
    </label>
  );
}
```


## API Docs

This library has 2 functions to create either a **global state**, or a local **Provider-based** state.
The method signatures are nearly identical: 

### createGlobalState

Creates a global, singleton state.

```ts
export const [ hooks, actions ] = createGlobalState({
  store: () => createStore( /*...*/ ),
  hooks: (useStore) => ({ /*...*/ }),
  actions: (setState, getState) => ({ /*...*/ }),
});
```

Key benefits of a **global** state:
- Does not require any Context Providers in your application
- All actions are static, and can be called from anywhere in the application.

### createProviderState

Creates a Provider-based state (using a React Context). 

```ts
export const [ hooks, useActions, Provider ] = createProviderState({
  store: (props) => createStore( /*...*/ ),
  hooks: (useStore) => ({ /*...*/ }),
  actions: (setState, getState, props) => ({ /*...*/ }),
});
```

The syntax is nearly identical to the `createGlobalState` with just a few minor differences:

- A `<Provider>` is returned, and is required in your React tree.
- The "actions" is returned as a `useActions` hook, instead of being static.
- You can (optionally) pass `props` to your `Provider`.  These props are accessible as an extra parameter to the `store` and `actions` functions.


To use this Provider-based state, you must add the `<Provider>` to your React tree.  This can be done at the root of your application (to make it "global") or for any nested area of the application.

Key benefits of a **Provider-based state**:
- A `Provider` can be used in multiple sections of your application, each one with separate state.
- When a `Provider` is unmounted, the state is destroyed; when it gets remounted, the state is reinitialized.
- The `Provider` can accept `props`, allowing you to customize the initial state, or customize the behavior of actions. 

## Configuration Options

Both `createGlobalState` and `createProviderState` require 3 configuration options with the following signature:

```ts
type ConfigurationOptions = {
  store: (props) => ZustandStore,
  hooks: (useStore) => THooks,
  actions: (setState, getState, props) => TActions,
};
```

> The `props` parameter is only available with  `createProviderState`.


### `store: (props) => ZustandStore`

Creates the Zustand store, which contains the initial state. Supports all Zustand middlewares.

> The `props` parameter is only available with  `createProviderState`.

```ts
import { createStore } from "zustand";
import { createGlobalState } from "zustand-refined";

export const [ hooks, actions ] = createGlobalState({
  store: () => createStore(() => ({ todos: [] })),
  /*...*/
});
```


> Note: when creating a Zustand store, normally the initializer accepts 2 parameters, like `createStore((setState, getState) => (initial state))`.  
> However, with `zustand-refined`, we will be creating our "getters" as `hooks`, and our "setters" as `actions`, so there is no need to use these parameters.  
> The `store` you create should ONLY return the actual state values, and should NOT use these getters or setters.


### `hooks: (useStore) => THooks`

Defines all the hooks that can be used for accessing the state.

The `useStore` parameter is the default Zustand hook, which supports an optional selector.  All your custom hooks should utilize the selector to ensure only the minimum amount of data is returned.  This ensures components don't have unnecessary rerenders.

```ts
export const [ hooks, actions ] = createGlobalState({
  store: () => createStore(() => ({ todos: [] })),
  hooks: (useStore) => ({
    /**
     * Returns the item with the specified id
     */
    useTodoById(id: string) {
      return useStore(s => s.todos.find(t => t.id === id))
    },
    /**
     * Returns the items that match the 'complete' state
     */
    useTodosByCompleteState(complete: boolean) {
      // 👇 Notice how this hook requires `useShallow` for proper caching:
      return useStore(useShallow(s => s.todos.filter(t => t.complete === complete)))
    }
  }),
  /*...*/
})
```

### `actions: (setState, getState, props) => TActions`
Defines all the methods that can be used for updating the state.

The `setState` and `getState` functions come directly from the Zustand store.  See the [createStore documentation](https://zustand.docs.pmnd.rs/apis/create-store#usage) for more details on using these functions.

It performs a shallow merge into the state.  It also supports a callback signature, which provides easy access to the current state. 

> The `props` parameter is only available with  `createProviderState`.





## Simple Stores

The `hooks` and `actions` methods can return **anything**.  
For example, for a simple store, you might only need to return a single hook, and a single action:

```ts
import { createGlobalState } from "zustand-refined";

export const [ useCounter, incrementCounter ] = createGlobalState({
  store: () => createStore(() => ({ count: 0 })),
  hooks: (useStore) => {
    const useCounter = () => useStore(s => s.count);
    return useCounter;
  },
  actions: (setState) => {
    const incrementCounter = () => setState(prev => ({ count: prev.count + 1 }));
    return incrementCounter;
  }
})
```

## Middleware

Middleware is fully supported!
Simply create your store using the desired middleware.

Some middleware changes the signature of `setState`.  For example, `devtools` adds a 3rd parameter.  This is automatically supported by the `useState` function that is passed to `actions`.

```ts
import { createStore } from "zustand";
import { devtools } from "zustand/middleware/devtools";
import { immer } from "zustand/middleware/immer";
import { createGlobalState } from "zustand-refined";

export const [ hooks, actions ] = createGlobalState({
  store: () => createStore(
    devtools(
      immer(
        () => ({ count: 0 })
      )
    )
  ),
  // (Hooks not affected by middleware)
  hooks: () => ({
    useCount: () => useStore(s => s.count),
  }),
  // `setState` now supports devtools and immer:
  actions: (setState) => ({
    increment() {
      setState(
        s => {
          // Use immer syntax:
          s.count++;
        },
        // replace:      
        false,
        // devtools adds this 3rd parameter:
        "counter/increment"
      )
    }
  })
})
```



## Zustand anti-patterns

Zustand is powerful, but its flexibility can easily cause problems in codebases.

The documentation shows 3 ways to read state, and 4 ways to update state!  Many of these approaches have hidden performance issues.

Using `zustand-refined` avoids most of these issues, but you should still be aware of these problems, so you can be sure to create a performant application.

### Bears Example

We will use this example from the Zustand docs:
```ts
const useBears = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}))
```

### 3 ways to read state

With the above example, there are 3 ways to retrieve the state: 

```tsx
function Bears1() {
  const bears = useBears.getState().bears;
  return <span>{bears}</span>
}
function Bears2() {
  const { bears } = useBears();
  return <span>{bears}</span>
}
function Bears3() {
  const bears = useBears(s => s.bears);
  return <span>{bears}</span>
}
```

Can you spot which approaches are problematic?

- `Bears1` didn't actually use the hook to access `bears`, so our component won't rerender when it changes.

- `Bears2` subscribes to ALL state updates.  This might not be very visible right now, since `bears` is the only state value.  But imagine we add `fishes` to our state; updates to `fishes` will cause `Bears2` to rerender.

- `Bears3` is implemented "correctly", and will only rerender when the `bears` value changes!  Using a selector ensures we minimize the rerendering.  This is great.  
However, even this approach comes with trouble.  The `useBears` hook doesn't require a selector, and even if it did, we can't enforce that the selector is picking the "minimum" amount of data.

Here's how `zustand-refined` solves this problem:
1. The `getState()` method is not exposed
2. The `useStore` hook is only exposed to the `hooks` configuration
3. The `hooks` configuration enables you to write specific hooks, which only return the minimum amount of data using selectors, can properly cache the selectors, and don't expose the entire state object.


### 4 ways to update state

With the Bears example, there are 4 ways to update state!

```tsx
function IncreaseBears1() {
  const increaseBears = () => useBears.setState(s => ({ bears: s.bears + 1 }));
  return <button onClick={increaseBears}>More Bears!</button>;
}
function IncreaseBears2() {
  const increaseBears = useBears.getState().increaseBears;
  return <button onClick={increaseBears}>More Bears!</button>;
}
function IncreaseBears3() {
  const { increaseBears } = useBears();
  return <button onClick={increaseBears}>More Bears!</button>;
}
function IncreaseBears4() {
  const increaseBears = useBears(s => s.increaseBears);
  return <button onClick={increaseBears}>More Bears!</button>;
}
```

Again, can you spot the problematic components?

- `IncreaseBears1` is clearly problematic, since there's no encapsulation. The component has to implement Zustand-specific APIs, and also must know how the state is stored.
- `IncreaseBears2` is not terrible, but the `getState()` call is a code smell ... you're NOT supposed to read state this way, so why should you be able to update state this way?
- `IncreaseBears3` is BAD! This component will now rerender whenever the state is updated!
- `IncreaseBears4` is also a code smell. The `increaseBears` method should not require a  hook call; putting actions behind a hook makes your components needlessly more complex.  Grabbing multiple actions is also quite cumbersome.

Again, here's how `zustand-refined` avoids these problems:

1. The `setState()` method is never exposed; it is only accessible within the `actions` method.
2. Actions are kept separate from the state.
3. For global state, Actions are returned as **static methods**, so they don't need to be defined inside a component at all, and don't require any hook calls.
4. For Provider state, all actions are grouped together in a static object, so you can grab all actions with a single `useActions()` hook call.  This hook will NEVER cause rerenders.

