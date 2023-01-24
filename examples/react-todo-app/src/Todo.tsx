import * as React from 'react';
import API from '../client';
import type { Todo } from '../todo-api';
import client from "../client";

export default function ({
  id,
  didDelete,
}: {
  id: number;
  didDelete: () => void;
}) {
  const [todo, setTodo] = React.useState<Todo>(null);

  const reloadTodo = () => {
    client.Read(id).then(setTodo);
  };

  React.useEffect(reloadTodo, []);

  if (!todo) return;

  const completeTodo = async (e) => {
    await client.put().Update(id, {
      ...todo,
      done: e.currentTarget.checked,
    });
    reloadTodo();
  };

  const deleteTodo = async () => {
    await client.delete().Delete(id);
    didDelete();
  };

  return (
    <div>
      <span>{todo.title}</span>
      <input
        type="checkbox"
        defaultChecked={todo.done}
        onChange={completeTodo}
      />
      {todo.done && <button onClick={deleteTodo}>Delete</button>}
    </div>
  );
}
