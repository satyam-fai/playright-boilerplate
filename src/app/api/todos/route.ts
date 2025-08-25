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

// POST /api/todos
export async function POST(request: Request) {
  try {
    const { title, userId } = await request.json();

    if (!title || !userId) {
      return NextResponse.json(
        { message: "Title and user ID are required" },
        { status: 400 }
      );
    }

    const newTodo = await createTodo({
      title,
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