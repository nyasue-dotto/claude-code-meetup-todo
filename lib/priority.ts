export type Priority = "high" | "medium" | "low";

export const PRIORITY_VALUES: Priority[] = ["high", "medium", "low"];

const ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

// high → medium → low の順、同優先度内は createdAt 昇順（古い順）
export function sortByPriority<T extends { priority: Priority; createdAt: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const diff = ORDER[a.priority] - ORDER[b.priority];
    if (diff !== 0) return diff;
    return a.createdAt < b.createdAt ? -1 : 1;
  });
}
