import * as React from 'react';
import API from '../client';
import type { Todo as TodoType } from '../todo-api';
import Todo from './Todo';

export default function () {
  const [todos, setTodos] = React.useState<TodoType['id'][]>([]);
  const inputRef = React.useRef<HTMLInputElement>();

  const reloadTodos = () => {
    API.client.List().then(setTodos);
  };

  React.useEffect(reloadTodos, []);

  const addTodo = async (e) => {
    e.preventDefault();
    const { value } = inputRef.current;

    if (!value) return;

    e.currentTarget.reset();

    await API.client.post().Create({
      title: value,
      done: false,
    });
    reloadTodos();
  };

  return (
    <>
      {todos.map((id) => (
        <Todo key={id} id={id} didDelete={reloadTodos} />
      ))}
      <form onSubmit={addTodo}>
        <input ref={inputRef} type="text" placeholder="New Todo" />
        <input type="submit" value="Add" />
      </form>
    </>
  );
}
