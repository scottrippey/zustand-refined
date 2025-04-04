# `zustand-refined`

`zustand-refined` makes the best of Zustand, by making it easy to adhere to its **best practices**.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of Contents** _generated with [DocToc](https://github.com/thlorenz/doctoc)_

- [Zustand Best Practices](#zustand-best-practices)
- [Installation](#installation)
- [Usage Example](#usage-example)
  - [Define your `store`, `hooks`, and `actions`](#define-your-store-hooks-and-actions)
  - [Using hooks and actions](#using-hooks-and-actions)
- [API Docs](#api-docs)
  - [createGlobalState](#createglobalstate)
  - [createProviderState](#createproviderstate)
  - [Configuration Options](#configuration-options)
    - [`store: (props) => ZustandStore`](#store-props--zustandstore)
    - [`hooks: (useStore) => THooks`](#hooks-usestore--thooks)
    - [`actions: (setState, getState, props) => TActions`](#actions-setstate-getstate-props--tactions)
- [Tips](#tips)
  - [Passing props](#passing-props)
  - [Simple Stores](#simple-stores)
  - [Zustand Middleware](#zustand-middleware)
- [Zustand anti-patterns](#zustand-anti-patterns)
  - [Bears Example](#bears-example)
  - [3 ways to read state](#3-ways-to-read-state)
  - [4 ways to update state](#4-ways-to-update-state)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Zustand Best Practices

`zustand-refined` has a simple API, designed to
avoid several [anti-patterns](#zustand-anti-patterns)
and help achieve these **best practices**:

- **Performance**
  - It should be easy to avoid unnecessary rerendering.
  - Hooks should only grab the minimum amount of state needed.
  - Actions should be static, and never cause rerenders.
  - Zustand's memoization techniques should be used correctly (like `useShallow`).
- **Separation of concerns**
  - The concepts of defining state, reading state, and updating state should be kept separate.
  - `store` defines your initial **state**
  - `hooks` defines the ways you can **read** state
  - `actions` defines the ways you can **update** state
- **Code Quality**
  - All Zustand-specific logic should be encapsulated. This includes middleware, selectors, and memoization techniques.
  - The raw state doesn't need to be exposed. Custom hooks should be used for accessing specific parts of state, and should deal with proper memoization.
  - Excellent TypeScript support. All types are inferred, so you don't have to manually declare your types.
- **Scalability**
  - It should be easy to create both **Global** stores and **Provider-based** local stores.
  - It should be easy to **migrate** from a Global store to a Provider-based local store.

## Installation

Install both `zustand-refined` and `zustand`:

```sh
npm install --save zustand zustand-refined
```

## Usage Example

### Define your `store`, `hooks`, and `actions`

Here's a classic "To Do" example, using a global state via `createGlobalState(...)`

```ts
import { createStore, useShallow } from "zustand";
import { createGlobalState } from "zustand-refined";

export type TodoItem = { id: string; title: string; complete: boolean };
export const [todoHooks, todoActions] = createGlobalState({
  // Define the initial state:
  store: () =>
    createStore(() => ({
      todos: [] as TodoItem[],
    })),
  // 👀 Define hooks for reading the state:
  hooks: (useStore) => ({
    useById: (id: string) => {
      return useStore((s) => {
        return s.todos.find((t) => t.id === id);
      });
    },
    useByCompleteState: (completed: boolean) => {
      // 👇 Notice how this hook requires `useShallow` for proper memoization:
      return useStore(
        useShallow((s) => {
          return s.todos.find((t) => t.completed === completed);
        }),
      );
    },
  }),
  // 📝 Define actions for updating the state:
  actions: (setState) => ({
    addTodo(item: TodoItem) {
      setState((state) => ({
        todos: [...state.todos, item],
      }));
    },
    toggleTodo(id: string, complete: boolean) {
      setState((state) => ({
        todos: state.todos.map((t) => (t.id === id ? { ...t, completed } : t)),
      }));
    },
    deleteTodo(id: string) {
      setState((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
      }));
    },
  }),
});
```

In this example, we export 2 objects:

- `todoHooks` is simply the return value of the `hooks` function
- `todoActions` is simply the return value of the `actions` function

### Using hooks and actions

The `hooks` are standard React hooks, so they can be used in components and other hooks.
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
export const [hooks, actions] = createGlobalState({
  store: () => createStore(/*...*/),
  hooks: (useStore) => ({
    /*...*/
  }),
  actions: (setState, getState) => ({
    /*...*/
  }),
});
```

Key benefits of a **global** state:

- Does not require any Context Providers in your application
- All actions are static, and can be called from anywhere in the application.

### createProviderState

Creates a Provider-based state (using a React Context).

```ts
export const [hooks, useActions, Provider] = createProviderState({
  store: (props) => createStore(/*...*/),
  hooks: (useStore) => ({
    /*...*/
  }),
  actions: (setState, getState, props) => ({
    /*...*/
  }),
});
```

The syntax is nearly identical to the `createGlobalState` with just a few minor differences:

- A `<Provider>` is returned, and is required in your React tree.
- The "actions" is returned as a `useActions` hook, instead of being static.
- You can (optionally) pass `props` to your `Provider`. These props are accessible as an extra parameter to the `store` and `actions` functions.

To use this Provider-based state, you must add the `<Provider>` to your React tree. This can be done at the root of your application (to make it "global") or for any nested area of the application.

Key benefits of a **Provider-based state**:

- A `Provider` can be used in multiple sections of your application, each one with separate state.
- When a `Provider` is unmounted, the state is destroyed; when it gets remounted, the state is reinitialized.
- The `Provider` can accept `props`, allowing you to customize the initial state, or customize the behavior of actions.
- Works well with Server-Side Rendering, especially with Next.js. Zustand recommends [using a Context-based state with Next.js](https://zustand.docs.pmnd.rs/guides/nextjs).

### Configuration Options

Both `createGlobalState` and `createProviderState` require 3 configuration options with the following signature:

```ts
type ConfigurationOptions = {
  store: (props) => ZustandStore;
  hooks: (useStore) => THooks;
  actions: (setState, getState, props) => TActions;
};
```

> The `props` parameter is only available with `createProviderState`.

#### `store: (props) => ZustandStore`

Creates the Zustand store, which contains the initial state. Supports all Zustand middlewares.

> The `props` parameter is only available with `createProviderState`.

```ts
import { createStore } from "zustand";
import { createGlobalState } from "zustand-refined";

export const [hooks, actions] = createGlobalState({
  store: () => createStore(() => ({ todos: [] })),
  /*...*/
});
```

> Note: when creating a Zustand store, normally the initializer accepts 2 parameters, like `createStore((setState, getState) => (initial state))`.  
> However, with `zustand-refined`, we will be creating our "getters" as `hooks`, and our "setters" as `actions`, so there is no need to use these parameters.  
> The `store` you create should ONLY return the actual state values, and should NOT use these getters or setters.

#### `hooks: (useStore) => THooks`

Defines all the hooks that can be used for accessing the state.

The `useStore` parameter is the default Zustand hook, which supports an optional selector. All your custom hooks should utilize the selector to ensure only the minimum amount of data is returned. This ensures components don't have unnecessary rerenders.

```ts
export const [hooks, actions] = createGlobalState({
  store: () => createStore(() => ({ todos: [] })),
  hooks: (useStore) => ({
    /**
     * Returns the item with the specified id
     */
    useTodoById(id: string) {
      return useStore((s) => s.todos.find((t) => t.id === id));
    },
    /**
     * Returns the items that match the 'complete' state
     */
    useTodosByCompleteState(complete: boolean) {
      // 👇 Notice how this hook requires `useShallow` for proper memoization:
      return useStore(useShallow((s) => s.todos.filter((t) => t.complete === complete)));
    },
  }),
  /*...*/
});
```

#### `actions: (setState, getState, props) => TActions`

Defines all the methods that can be used for updating the state.

The `setState` and `getState` functions come directly from the Zustand store. See the [createStore documentation](https://zustand.docs.pmnd.rs/apis/create-store#usage) for more details on using these functions.

It performs a shallow merge into the state. It also supports a callback signature, which provides easy access to the current state.

> The `props` parameter is only available with `createProviderState`.

## Tips

### Passing props

One of the big advantages of `createProviderState` is that it supports passing in `props`. Here's an example:

```tsx
import type { RefObject } from "react";
type CounterProps = {
  initialCount: number;
  incrementBy?: number;
};
export const [counterHooks, useCounterActions, CounterProvider] = createProviderState({
  // we define here 👇 what props we expect
  store: (props: RefObject<CounterProps>) =>
    createStore(() => ({
      count: props.current.initialCount,
    })),
  hooks: (useStore) => ({
    useCount: () => useStore((s) => s.count),
  }),
  // The props are passed in here 👇 too
  actions: (setState, getState, props) => ({
    increment: () =>
      setState((s) => ({
        count: s.count + props.current.incrementBy ?? 1,
      })),
  }),
});
```

> Note: `props` is passed as a `RefObject`, which means you must use `props.current` to retrieve the most current props

These props get passed through the `Provider` in your app:

```tsx
function ExampleApp() {
  return (
    <>
      <CounterProvider initialCount={0}>
        <Widget />
      </CounterProvider>
      <CounterProvider initialCount={50} incrementBy={10}>
        <Widget />
      </CounterProvider>
    </>
  );
}
```

### Simple Stores

The `hooks` and `actions` methods can return **anything**.  
For example, for a simple store, you might only need to return a single hook, and a single action:

```ts
import { createGlobalState } from "zustand-refined";

export const [useCounter, incrementCounter] = createGlobalState({
  store: () => createStore(() => ({ count: 0 })),
  hooks: (useStore) => {
    const useCounter = () => useStore((s) => s.count);
    return useCounter;
  },
  actions: (setState) => {
    const incrementCounter = () => setState((prev) => ({ count: prev.count + 1 }));
    return incrementCounter;
  },
});
```

### Zustand Middleware

Middleware is fully supported!
Simply create your store using the desired middleware.

Some middleware changes the signature of `setState`. For example, `devtools` adds a 3rd parameter. This is automatically supported by the `useState` function that is passed to `actions`.

```ts
import { createStore } from "zustand";
import { devtools } from "zustand/middleware/devtools";
import { immer } from "zustand/middleware/immer";
import { createGlobalState } from "zustand-refined";

export const [hooks, actions] = createGlobalState({
  store: () => createStore(devtools(immer(() => ({ count: 0 })))),
  // (Hooks not affected by middleware)
  hooks: () => ({
    useCount: () => useStore((s) => s.count),
  }),
  // `setState` now supports devtools and immer:
  actions: (setState) => ({
    increment() {
      setState(
        (s) => {
          // Use immer syntax:
          s.count++;
        },
        // replace:
        false,
        // devtools adds this 3rd parameter:
        "counter/increment",
      );
    },
  }),
});
```

## Zustand anti-patterns

Zustand is powerful, but its flexibility can easily cause problems in codebases.

The documentation shows 3 ways to read state, and 4 ways to update state! Many of these approaches have hidden performance issues.

Using `zustand-refined` avoids most of these issues, but you should still be aware of these problems, so you can be sure to create a performant application.

### Bears Example

We will use this example from the Zustand docs:

```ts
const useBears = create((set) => ({
  bears: 0,
  increaseBears: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}));
```

### 3 ways to read state

With the above example, there are 3 ways to retrieve the state:

```tsx
function Bears1() {
  const bears = useBears.getState().bears;
  return <span>{bears}</span>;
}
function Bears2() {
  const { bears } = useBears();
  return <span>{bears}</span>;
}
function Bears3() {
  const bears = useBears((s) => s.bears);
  return <span>{bears}</span>;
}
```

Can you spot which approaches above are problematic?

- ⛔️ `Bears1` didn't actually use the hook to access `bears`, so our component won't rerender when it changes.

- ⛔️ `Bears2` subscribes to ALL state updates. This might not be very visible right now, since `bears` is the only state value. But imagine we add `fishes` to our state; updates to `fishes` will cause `Bears2` to rerender.

- 👍 `Bears3` is implemented "correctly", because it uses a selector to pick the state it needs. It will only rerender when the `bears` value changes! Using a selector ensures we minimize the rerendering. This is great.  
  ⚠️ However, even this approach comes with trouble. The selector is optional in the `useBears` hook. And, using a selector can be tricky; some selectors need to be wrapped with Zustand's `useShallow` for them to work correctly!

So all 3 approaches are problematic, to varying degrees!

### 4 ways to update state

With the Bears example, there are 4 ways to update state!

```tsx
function IncreaseBears1() {
  const increaseBears = () => useBears.setState((s) => ({ bears: s.bears + 1 }));
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
  const increaseBears = useBears((s) => s.increaseBears);
  return <button onClick={increaseBears}>More Bears!</button>;
}
```

Again, can you spot the problematic components above?

- ⚠️ `IncreaseBears1` is clearly problematic, since there's no encapsulation. The component has to implement Zustand-specific APIs, and also must know how the state is stored.
- ⚠️ `IncreaseBears2` is not terrible, but the `getState()` call is a code smell ... you're NOT supposed to read state this way, so why should you be able to update state this way?
- ⛔️ `IncreaseBears3` is BAD! This component will now rerender whenever the state is updated!
- ⚠️ `IncreaseBears4` is also a code smell. The `increaseBears` method should not require a hook call; putting actions behind a hook makes your components needlessly more complex. Grabbing multiple actions is also quite cumbersome.

They're all problematic, to varying degrees.

### How `zustand-refined` prevents these anti-patterns

Implementing this same store with `zustand-refined` is very easy! It simply requires you to **separate** the `store`, the `hooks`, and the `actions`:

```tsx
import { createGlobalState } from "./zustand-refined";

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
    updateBears: (newBears) => setState({ bears: newBears }),
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
```

Here's how `zustand-refined` solved those anti-patterns:

1. **Encapsulation**: all Zustand implementation details are encapsulated. You only expose custom `hooks` for reading state, and custom `actions` for setting it.
2. The raw `getState()`, `setState()`, and `useStore(selector)` methods are never exported. You can only access them internally.
3. The `store` configuration contains just the state.
4. The `actions` configuration encapsulates the `setState()` method, and exposes your own actions.
5. The `hooks` configuration encapsulates the `useStore(selector)` hook, and exposes your own hooks.
6. When creating specific hooks, you determine how to use selectors, and you also are responsible for memoizing the selector values (using Zustand's `useShallow` when necessary).
7. `actions` are easy to use, and will NEVER cause rerenders!

- For global state, Actions are returned as **static methods**, which are easy to import and call without using any hooks.
- For Provider-based state, the `useActions()` hook returns all the actions. The actions are static, and will NEVER cause rerenders.
