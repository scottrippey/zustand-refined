import { createStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { createGlobalStore, createLocalStore } from "../zustand-actions-2";

type TodoItem = { completed: boolean; title: string };
export const [hooks, useActions, TodoProvider] = createLocalStore({
  store: () =>
    createStore(() => ({
      todos: [] as TodoItem[],
    })),
  hooks: (useStore) => ({
    useTodos: () => useStore((s) => s.todos),
    useCompleted: () =>
      useStore(useShallow((s) => s.todos.filter((t) => t.completed))),
    useIncomplete: () =>
      useStore(useShallow((s) => s.todos.filter((t) => !t.completed))),
  }),
  actions: (setState) => ({
    add(item: TodoItem) {
      setState((prev) => ({
        todos: [...prev.todos, item],
      }));
    },
    toggleCompleted(item: TodoItem) {
      setState((prev) => ({
        todos: prev.todos.map((t) => {
          return t !== item ? t : { ...t, completed: !t.completed };
        }),
      }));
    },
  }),
});
