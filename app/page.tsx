"use client";

import { useCallback, useEffect, useState } from "react";
import type { Todo } from "@/lib/store";
import { formatDue, isOverdue, todayStr } from "@/lib/date";
import { type Priority, sortByPriority } from "@/lib/priority";

type Filter = "all" | "active" | "done";
type Sort = "created" | "priority";

const PRIORITY_LABELS: Record<Priority, string> = { high: "高", medium: "中", low: "低" };

const FILTER_LABELS: { key: Filter; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "active", label: "未完了" },
  { key: "done", label: "完了済み" },
];

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("created");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/todos");
    setTodos(await res.json());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dueDate, priority }),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "登録に失敗しました");
      return;
    }
    setTitle("");
    setDueDate("");
    setPriority("medium");
    await refresh();
  }

  async function toggle(id: string) {
    await fetch(`/api/todos/${id}`, { method: "PATCH" });
    await refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    await refresh();
  }

  const today = todayStr();
  const doneCount = todos.filter((t) => t.completed).length;
  const summaryText = `${doneCount} / ${todos.length} 件完了`;

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });
  const visible = sort === "priority" ? sortByPriority(filtered) : filtered;

  return (
    <main>
      <h1>meetup-todo</h1>
      <form className="add-form" onSubmit={add}>
        <input
          type="text"
          placeholder="タスクを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
        <button type="submit">追加</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="filters">
        {FILTER_LABELS.map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? "active" : ""}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
        >
          <option value="created">作成順</option>
          <option value="priority">優先度順</option>
        </select>
      </div>
      <ul className="todo-list">
        {visible.map((t) => (
          <li key={t.id} className={`todo-item${t.completed ? " completed" : ""}`}>
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => toggle(t.id)}
            />
            <span className="title">{t.title}</span>
            <span className={`badge-priority badge-${t.priority}`}>
              {PRIORITY_LABELS[t.priority]}
            </span>
            {!t.completed && isOverdue(t.dueDate, today) && (
              <span className="badge-overdue">期限切れ</span>
            )}
            <span className="due">{formatDue(t.dueDate)}</span>
            <button className="delete" onClick={() => remove(t.id)} aria-label="削除">
              ×
            </button>
          </li>
        ))}
        {visible.length === 0 && <li className="empty">タスクがありません</li>}
      </ul>
    </main>
  );
}
