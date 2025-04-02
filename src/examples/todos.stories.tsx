import { Meta } from "@storybook/react";
import { createStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { createGlobalState } from "../zustand-refined";

const meta: Meta = {};
export default meta;

type TodoItem = { completed: boolean; title: string; id: string };
const [todoHooks, todoActions] = createGlobalState({
  store: () =>
    createStore(() => ({
      todos: [] as TodoItem[],
    })),
  hooks: (useStore) => ({
    useById: (id: TodoItem["id"]) =>
      useStore((s) => s.todos.find((t) => t.id === id)!),
    useCompleted: () =>
      useStore(useShallow((s) => s.todos.filter((t) => t.completed))),
    useIncomplete: () =>
      useStore(useShallow((s) => s.todos.filter((t) => !t.completed))),
  }),
  actions: (setState) => ({
    add(item: Omit<TodoItem, "id">) {
      setState((prev) => ({
        todos: [...prev.todos, { ...item, id: Math.random().toString() }],
      }));
    },
    toggleCompleted(id: TodoItem["id"], completed: boolean) {
      setState((prev) => ({
        todos: prev.todos.map((t) => {
          return t.id !== id ? t : { ...t, completed };
        }),
      }));
    },
  }),
});

// UI Demo:
export function Todos() {
  const completed = todoHooks.useCompleted();
  const incomplete = todoHooks.useIncomplete();
  return (
    <section>
      <fieldset>
        <legend>Incomplete</legend>
        {incomplete.map((todo) => (
          <Todo key={todo.id} id={todo.id} />
        ))}
      </fieldset>
      <fieldset>
        <legend>Complete</legend>
        {completed.map((todo) => (
          <Todo key={todo.id} id={todo.id} />
        ))}
      </fieldset>
    </section>
  );
}
function Todo(props: { id: string }) {
  const todo = todoHooks.useById(props.id);
  return (
    <label>
      <input
        checked={todo.completed}
        onChange={(ev) => {
          todoActions.toggleCompleted(todo.id, ev.currentTarget.checked);
        }}
      />
      {todo.title}
    </label>
  );
}
