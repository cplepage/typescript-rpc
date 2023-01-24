import {Delete, Get, Post, Put} from "typescript-rpc/createHandler";

export type Todo = {
  id: number;
  title: string;
  done: boolean;
};

let todos: Todo[] = [];

export default class Api {

  async List() {
    return todos.map((todo) => todo.id);
  }

  @Post()
  async Create(todo: Omit<Todo, 'id'>) {
    const id = Math.floor(Math.random() * 888889 + 111111);
    todos.push({ id: id, ...todo });
    return id;
  }

  @Get()
  async Read(id: number) {
    return todos.find((todo) => todo.id === id);
  }

  @Put()
  async Update(id: number, updatedTodo: Todo) {
    todos = todos.map((todo) => (todo.id === id ? updatedTodo : todo));
  }

  @Delete()
  async Delete(id: number) {
    todos = todos.filter((todo) => todo.id !== id);
  }
}
