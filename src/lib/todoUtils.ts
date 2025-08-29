import { readDataFromFile, writeDataToFile } from "@/lib/fileUtils";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
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

/**
 * Create and persist a new todo item.
 *
 * Builds a complete Todo (generating `id`, `createdAt`, `updatedAt`) from the provided fields,
 * applies sensible defaults for optional properties, appends it to the stored list, and writes
 * the updated list back to "todos.json".
 *
 * @param todo - New todo fields. Optional properties are defaulted if omitted: `description` -> '',
 * `priority` -> 'medium', `category` -> '', `dueDate` -> '', `completed` -> false. `userId` must be provided.
 * @returns The newly created Todo with generated `id`, `createdAt`, and `updatedAt`.
 */
export async function createTodo(todo: Omit<Todo, "id" | "createdAt" | "updatedAt">): Promise<Todo> {
  const todos = await readDataFromFile("todos.json");

  const newTodo: Todo = {
    id: Date.now().toString(),
    title: todo.title,
    description: todo.description || '',
    priority: todo.priority || 'medium',
    category: todo.category || '',
    dueDate: todo.dueDate || '',
    completed: todo.completed || false,
    userId: todo.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  await writeDataToFile("todos.json", todos);

  return newTodo;
}

/**
 * Update fields of an existing todo and persist the change.
 *
 * @param id - ID of the todo to update
 * @param updates - Partial set of todo fields to replace (cannot change `id`, `createdAt`, or `userId`)
 * @returns The updated Todo object after persisting, or `null` if a todo with the given `id` was not found
 */
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

/**
 * Deletes a todo item by its id.
 *
 * Attempts to remove the todo with the given `id` from persistent storage.
 *
 * @param id - The id of the todo to delete.
 * @returns `true` if a todo was found and deleted; `false` if no todo with the given `id` exists.
 */
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