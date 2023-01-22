import * as React from 'react';
import { createRoot } from 'react-dom/client';
import TodoList from './TodoList';

export default function () {
  const root = createRoot(document.getElementById('root'));
  root.render(
    <>
      <h3>typescript-rpc React Todo App</h3>
      <TodoList />
    </>
  );
}
