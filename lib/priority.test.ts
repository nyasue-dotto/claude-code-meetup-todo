import { describe, it, expect } from "vitest";
import { sortByPriority } from "./priority";

const item = (priority: "high" | "medium" | "low", createdAt: string) => ({
  id: createdAt,
  title: "test",
  priority,
  createdAt,
});

describe("sortByPriority", () => {
  it("high → medium → low の順に並ぶ", () => {
    const input = [
      item("low", "2026-01-03"),
      item("high", "2026-01-01"),
      item("medium", "2026-01-02"),
    ];
    const result = sortByPriority(input);
    expect(result.map((t) => t.priority)).toEqual(["high", "medium", "low"]);
  });

  it("同一優先度内は createdAt 昇順（古い順）で並ぶ", () => {
    const input = [
      item("high", "2026-01-03"),
      item("high", "2026-01-01"),
      item("high", "2026-01-02"),
    ];
    const result = sortByPriority(input);
    expect(result.map((t) => t.createdAt)).toEqual([
      "2026-01-01",
      "2026-01-02",
      "2026-01-03",
    ]);
  });

  it("元の配列を変更しない", () => {
    const input = [item("low", "2026-01-02"), item("high", "2026-01-01")];
    const original = [...input];
    sortByPriority(input);
    expect(input).toEqual(original);
  });

  it("空配列を渡すと空配列を返す", () => {
    expect(sortByPriority([])).toEqual([]);
  });
});
