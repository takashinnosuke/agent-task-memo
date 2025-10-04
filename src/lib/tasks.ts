import { execute, executeAndReturnId, queryAll, queryGet, withTransaction, QueryParam } from './db';
import { DashboardSummary, QuickMemo, Task, TaskDependency, TaskFilters } from '@/types/task';

export async function listTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const conditions: string[] = [];
  const params: QueryParam[] = [];

  if (filters.search) {
    conditions.push(`(task_name LIKE ? OR task_goal LIKE ?)`);
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.automationLevel && filters.automationLevel !== 'all') {
    conditions.push('automation_level = ?');
    params.push(filters.automationLevel);
  }
  if (filters.priority && filters.priority !== 'all') {
    conditions.push('priority = ?');
    params.push(filters.priority);
  }
  if (filters.owner) {
    conditions.push('(tobe_owner = ? OR asis_owner = ? OR tobe_owner IS NULL)');
    params.push(filters.owner, filters.owner);
  }
  if (filters.startDate) {
    conditions.push('date(updated_at) >= date(?)');
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push('date(updated_at) <= date(?)');
    params.push(filters.endDate);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortField = filters.sortField === 'id' ? 'id' : 'updated_at';
  const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

  return queryAll<Task>(
    `SELECT * FROM tasks ${where} ORDER BY ${sortField} ${sortOrder}`,
    params,
  );
}

export async function getTask(id: number): Promise<Task | undefined> {
  return queryGet<Task>('SELECT * FROM tasks WHERE id = ?', [id]);
}

export async function createTask(data: Partial<Task>): Promise<number> {
  const id = await executeAndReturnId(
    `INSERT INTO tasks (
      task_name, task_goal, automation_level, tobe_owner, input_info, output_info,
      data_standard, trigger_event, asis_owner, agent_capability, tools_systems,
      exception_cases, error_handling, target_time, target_time_unit,
      confidentiality, audit_log_required, learning_mechanism, kpi_metrics,
      cost_benefit, comments, priority, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [
      data.task_name,
      data.task_goal,
      data.automation_level,
      data.tobe_owner,
      data.input_info,
      data.output_info,
      data.data_standard,
      data.trigger_event,
      data.asis_owner,
      data.agent_capability,
      data.tools_systems,
      data.exception_cases,
      data.error_handling,
      data.target_time,
      data.target_time_unit,
      data.confidentiality,
      data.audit_log_required ? 1 : 0,
      data.learning_mechanism,
      data.kpi_metrics,
      data.cost_benefit,
      data.comments,
      data.priority || '中',
    ],
  );
  return id;
}

export async function updateTask(id: number, data: Partial<Task>): Promise<void> {
  const fields: string[] = [];
  const params: QueryParam[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (key === 'id' || value === undefined) return;
    fields.push(`${key} = ?`);
    params.push(value as QueryParam);
  });
  fields.push('updated_at = CURRENT_TIMESTAMP');

  if (!fields.length) return;

  await execute(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
}

export async function deleteTask(id: number): Promise<void> {
  await withTransaction(async () => {
    await execute('DELETE FROM task_dependencies WHERE task_id = ? OR depends_on_task_id = ?', [id, id]);
    await execute('DELETE FROM quick_memos WHERE task_id = ?', [id]);
    await execute('DELETE FROM tasks WHERE id = ?', [id]);
  });
}

export async function upsertDependencies(taskId: number, dependencyIds: number[]): Promise<void> {
  await withTransaction(async () => {
    await execute('DELETE FROM task_dependencies WHERE task_id = ?', [taskId]);
    for (const dependsOnId of dependencyIds) {
      if (dependsOnId === taskId) continue;
      await execute(
        'INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES (?, ?)',
        [taskId, dependsOnId],
      );
    }
  });
}

export async function listDependencies(): Promise<TaskDependency[]> {
  return queryAll<TaskDependency>('SELECT * FROM task_dependencies');
}

export async function createQuickMemo(payload: { taskId?: number | null; taskName?: string; memoContent: string; }): Promise<number> {
  return executeAndReturnId(
    `INSERT INTO quick_memos (task_id, task_name, memo_content) VALUES (?, ?, ?)`
    , [payload.taskId ?? null, payload.taskName ?? null, payload.memoContent],
  );
}

export async function listQuickMemos(): Promise<QuickMemo[]> {
  return queryAll<QuickMemo>('SELECT * FROM quick_memos ORDER BY created_at DESC LIMIT 50');
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const tasks = await queryAll<Task>('SELECT * FROM tasks');

  const automationLevelCounts: Record<string, number> = { '◎': 0, '△': 0, '×': 0 };
  const priorityCounts: Record<string, number> = { '高': 0, '中': 0, '低': 0 };
  const confidentialityCounts: Record<string, number> = { '高': 0, '中': 0, '低': 0 };

  let totalTargetTime = 0;
  let targetTimeCount = 0;

  tasks.forEach((task) => {
    if (task.automation_level && automationLevelCounts[task.automation_level] !== undefined) {
      automationLevelCounts[task.automation_level] += 1;
    }
    if (task.priority && priorityCounts[task.priority] !== undefined) {
      priorityCounts[task.priority] += 1;
    }
    if (task.confidentiality && confidentialityCounts[task.confidentiality] !== undefined) {
      confidentialityCounts[task.confidentiality] += 1;
    }
    if (task.target_time) {
      totalTargetTime += Number(task.target_time);
      targetTimeCount += 1;
    }
  });

  const weeklyMap = new Map<string, number>();
  const monthlyMap = new Map<string, number>();

  tasks.forEach((task) => {
    const createdAt = task.created_at ? new Date(task.created_at) : new Date();
    const weekKey = `${createdAt.getFullYear()}-W${String(
      getWeekNumber(createdAt),
    ).padStart(2, '0')}`;
    const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
    weeklyMap.set(weekKey, (weeklyMap.get(weekKey) ?? 0) + 1);
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + 1);
  });

  const weeklyTrend = Array.from(weeklyMap.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([week, count]) => ({ week, count }));
  const monthlyTrend = Array.from(monthlyMap.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([month, count]) => ({ month, count }));

  return {
    totalTasks: tasks.length,
    automationLevelCounts,
    priorityCounts,
    confidentialityCounts,
    averageTargetTime: targetTimeCount ? totalTargetTime / targetTimeCount : null,
    weeklyTrend,
    monthlyTrend,
  };
}

function getWeekNumber(date: Date): number {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
