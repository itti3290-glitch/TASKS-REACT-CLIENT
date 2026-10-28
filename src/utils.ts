import type { Task } from './types';

export type TaskStatus = 'open' | 'partial' | 'full' | 'past';

export const statusLabels: Record<TaskStatus, string> = {
  open: 'פנויה',
  partial: 'חסרים מתנדבים',
  full: 'מלאה',
  past: 'הסתיימה',
};

export function getTaskStatus(task: Task): TaskStatus {
  if (new Date(task.starts_at) < new Date()) return 'past';
  if (task.signed_up_count >= task.volunteers_needed) return 'full';
  if (task.signed_up_count > 0) return 'partial';
  return 'open';
}

export type SortOption = 'date' | 'patient' | 'title';

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'date', label: 'תאריך' },
  { value: 'patient', label: 'שם מטופל' },
  { value: 'title', label: 'שם משימה' },
];

// Returns a sorted copy; the original list is not changed.
export function sortTasks(tasks: Task[], sortBy: SortOption) {
  const sorted = [...tasks];
  if (sortBy === 'date') sorted.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  if (sortBy === 'patient') sorted.sort((a, b) => a.patient_name.localeCompare(b.patient_name, 'he'));
  if (sortBy === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title, 'he'));
  return sorted;
}
