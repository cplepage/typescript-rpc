import {Delete, Get, Post, Put} from "typescript-rpc/createHandler";

export type Todo = {
  id: number;
  title: string;
  done: boolean;
};

const todos: Map<Todo['id'], Todo> = new Map();

export default class Api {

  async List() {
    return Array.from(todos.keys());
  }

  @Post()
  async Create(todo: Omit<Todo, 'id'>) {
    const id = randomIntFromInterval(111111, 999999);
    todos.set(id, { id: id, ...todo });
    return id;
  }

  @Get()
  async Read(id: number) {
    return todos.get(id);
  }

  @Put()
  async Update(id: number, todo: Todo) {
    todos.set(id, todo);
  }

  @Delete()
  async Delete(id: number) {
    todos.delete(id);
  }
}

// source: https://stackoverflow.com/a/7228322
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
