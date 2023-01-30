import { Delete, Get, Post, Put } from 'typescript-rpc/createHandler';

export type Todo = {
  id: string;
  title: string;
  done: boolean;
};

const todos: Map<Todo['id'], Todo> = new Map();

export default class Todos {
  async List() {
    return Array.from(todos.keys());
  }

  @Post()
  Create(todo: Omit<Todo, 'id'>) {
    const id = randomIntFromInterval(111111, 999999).toString();
    todos.set(id, { id: id, ...todo });
    return id;
  }

  @Get()
  Read(id: string) {
    return todos.get(id);
  }

  @Put()
  Update(id: string, todo: Todo) {
    todos.set(id, todo);
  }

  @Delete()
  Delete(id: string) {
    todos.delete(id);
  }
}

// source: https://stackoverflow.com/a/7228322
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
