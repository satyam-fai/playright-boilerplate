import { NextResponse } from "next/server";
import { getTodosByUserId, createTodo } from "@/lib/todoUtils";

// GET /api/todos?userId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const todos = await getTodosByUserId(userId);
    return NextResponse.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      { message: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

/**
 * Create a new todo for a user.
 *
 * Expects a JSON request body with `title` and `userId` (required). Optional fields:
 * `description`, `priority` (defaults to `"medium"`), `category`, and `dueDate`.
 *
 * Returns a JSON response:
 * - 201: created todo object
 * - 400: when `title` or `userId` is missing (body validation)
 * - 500: on internal error
 *
 * @param request - Incoming HTTP request whose JSON body contains the todo fields described above.
 * @returns A NextResponse with the created todo (status 201) or an error message (status 400 or 500).
 */
export async function POST(request: Request) {
  try {
    const { title, description, priority, category, dueDate, userId } = await request.json();

    if (!title || !userId) {
      return NextResponse.json(
        { message: "Title and user ID are required" },
        { status: 400 }
      );
    }

    const newTodo = await createTodo({
      title,
      description,
      priority: priority || 'medium',
      category,
      dueDate,
      userId,
      completed: false,
    });

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { message: "Failed to create todo" },
      { status: 500 }
    );
  }
}