export type Todo = {
  id: number;
  title: string;
  done: boolean;
};

let todos: Todo[] = [];

const api = {
  async List() {
    return todos.map((todo) => todo.id);
  },
  async Create(todo: Omit<Todo, 'id'>) {
    const id = Math.floor(Math.random() * 888889 + 111111);
    todos.push({ id: id, ...todo });
    return id;
  },
  async Read(id: number) {
    return todos.find((todo) => todo.id === id);
  },
  async Update(id: number, updatedTodo: Todo) {
    todos = todos.map((todo) => (todo.id === id ? updatedTodo : todo));
  },
  async Delete(id: number) {
    todos = todos.filter((todo) => todo.id !== id);
  },
};

export default api;
