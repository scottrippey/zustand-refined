import { Meta } from "@storybook/react";
import { createStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { createGlobalState } from "../zustand-refined";

const meta: Meta = {};
export default meta;

type TodoItem = {
  id: string;
  completed: boolean;
  title: string;
  description: string;
};
const [todoHooks, todoActions] = createGlobalState({
  store: () =>
    createStore(() => ({
      todos: [] as TodoItem[],
    })),
  hooks: (useStore) => ({
    useById: (id: TodoItem["id"]) =>
      useStore((s) => {
        return s.todos.find((t) => t.id === id)!;
      }),
    useCompletedIds: () =>
      useStore(
        useShallow((s) => {
          return s.todos.filter((t) => t.completed).map((t) => t.id);
        }),
      ),
    useIncompleteIds: () =>
      useStore(
        useShallow((s) => {
          return s.todos.filter((t) => !t.completed).map((t) => t.id);
        }),
      ),
  }),
  actions: (setState) => ({
    add(item: Omit<TodoItem, "id">) {
      setState((prev) => ({
        todos: [...prev.todos, { ...item, id: Math.random().toString() }],
      }));
    },
    update(id: TodoItem["id"], updates: Partial<Omit<TodoItem, "id">>) {
      setState((prev) => ({
        todos: prev.todos.map((item) => {
          return item.id === id ? { ...item, ...updates } : item;
        }),
      }));
    },
  }),
});

// UI Demo:
export function Todos() {
  return (
    <section>
      <fieldset>
        <legend>Incomplete</legend>
        <TodoListIncomplete />
      </fieldset>
      <fieldset>
        <legend>Complete</legend>
        <TodoListComplete />
      </fieldset>
    </section>
  );
}
function TodoListComplete() {
  const completed = todoHooks.useCompletedIds();
  return completed.map((id) => <Todo key={id} id={id} />);
}
function TodoListIncomplete() {
  const incomplete = todoHooks.useIncompleteIds();
  return incomplete.map((id) => <Todo key={id} id={id} />);
}
function Todo(props: { id: string }) {
  const todo = todoHooks.useById(props.id);
  return (
    <label>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(ev) => {
          todoActions.update(todo.id, { completed: ev.currentTarget.checked });
        }}
      />
      {todo.title}
    </label>
  );
}
function TodoEdit(props: { id: string }) {
  const todo = todoHooks.useById(props.id);
  return (
    <span>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(ev) => {
          todoActions.update(todo.id, { completed: ev.currentTarget.checked });
        }}
      />
      <input
        type="text"
        name="title"
        value={todo.title}
        onChange={(ev) => {
          todoActions.update(todo.id, { title: ev.currentTarget.value });
        }}
      />
      <input
        type="text"
        name="description"
        value={todo.description}
        onChange={(ev) => {
          todoActions.update(todo.id, { description: ev.currentTarget.value });
        }}
      />
    </span>
  );
}
