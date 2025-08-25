import { readDataFromFile, writeDataToFile } from "@/lib/fileUtils";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Get all todos for a user
export async function getTodosByUserId(userId: string): Promise<Todo[]> {
  const todos = await readDataFromFile("todos.json");
  return todos.filter((todo: Todo) => todo.userId === userId);
}

// Get a todo by ID
export async function getTodoById(id: string): Promise<Todo | undefined> {
  const todos = await readDataFromFile("todos.json");
  return todos.find((todo: Todo) => todo.id === id);
}

// Create a new todo
export async function createTodo(todo: Omit<Todo, "id" | "createdAt" | "updatedAt">): Promise<Todo> {
  const todos = await readDataFromFile("todos.json");
  
  const newTodo: Todo = {
    id: Date.now().toString(),
    ...todo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  todos.push(newTodo);
  await writeDataToFile("todos.json", todos);
  
  return newTodo;
}

// Update a todo
export async function updateTodo(id: string, updates: Partial<Omit<Todo, "id" | "createdAt" | "userId">>): Promise<Todo | null> {
  const todos = await readDataFromFile("todos.json");
  const todoIndex = todos.findIndex((todo: Todo) => todo.id === id);
  
  if (todoIndex === -1) {
    return null;
  }
  
  const updatedTodo = {
    ...todos[todoIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  todos[todoIndex] = updatedTodo;
  await writeDataToFile("todos.json", todos);
  
  return updatedTodo;
}

// Delete a todo
export async function deleteTodo(id: string): Promise<boolean> {
  const todos = await readDataFromFile("todos.json");
  const todoIndex = todos.findIndex((todo: Todo) => todo.id === id);
  
  if (todoIndex === -1) {
    return false;
  }
  
  todos.splice(todoIndex, 1);
  await writeDataToFile("todos.json", todos);
  
  return true;
}