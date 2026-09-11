import { NextResponse } from "next/server";
import { addTodo, listTodos } from "@/lib/store";
import { PRIORITY_VALUES, type Priority } from "@/lib/priority";

export async function GET() {
  const todos = await listTodos();
  return NextResponse.json(todos);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const dueDate = typeof body?.dueDate === "string" && body.dueDate !== "" ? body.dueDate : null;

  if (title === "") {
    return NextResponse.json({ error: "タスク名を入力してください" }, { status: 400 });
  }
  if (title.length > 100) {
    return NextResponse.json({ error: "タスク名は100文字以内で入力してください" }, { status: 400 });
  }

  const rawPriority = body?.priority;
  const priority: Priority = PRIORITY_VALUES.includes(rawPriority) ? rawPriority : "medium";

  const todo = await addTodo(title, dueDate, priority);
  return NextResponse.json(todo, { status: 201 });
}
