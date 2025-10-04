'use client';

import { useMemo, useState } from 'react';
import clsx from 'classnames';
import useSWR from 'swr';
import { Task, AutomationLevel, PriorityLevel } from '@/types/task';
import { fetcher } from '@/lib/fetcher';

interface TaskTableResponse {
  tasks: Task[];
}

const automationFilters: (AutomationLevel | 'all')[] = ['all', '◎', '△', '×'];
const priorityFilters: (PriorityLevel | 'all')[] = ['all', '高', '中', '低'];

const filterInputClasses =
  'w-full rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-sm backdrop-blur transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 placeholder:text-slate-400';

const automationBadge: Record<AutomationLevel, string> = {
  '◎': 'border-emerald-200/80 bg-emerald-100/70 text-emerald-700',
  '△': 'border-amber-200/80 bg-amber-100/70 text-amber-700',
  '×': 'border-rose-200/80 bg-rose-100/70 text-rose-700',
};

const priorityBadge: Record<PriorityLevel, string> = {
  高: 'border-indigo-200/70 bg-indigo-100/70 text-indigo-700',
  中: 'border-sky-200/70 bg-sky-100/70 text-sky-700',
  低: 'border-slate-200/70 bg-slate-100/70 text-slate-600',
};

const confidentialityBadge: Record<'高' | '中' | '低', string> = {
  高: 'border-rose-200/60 bg-rose-100/70 text-rose-700',
  中: 'border-amber-200/60 bg-amber-100/70 text-amber-700',
  低: 'border-slate-200/60 bg-slate-100/70 text-slate-600',
};

export function TaskTable({ onRefresh, refreshSignal }: { onRefresh: () => void; refreshSignal: number }) {
  const [search, setSearch] = useState('');
  const [automationLevel, setAutomationLevel] = useState<AutomationLevel | 'all'>('all');
  const [priority, setPriority] = useState<PriorityLevel | 'all'>('all');
  const [owner, setOwner] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState<'updated_at' | 'id'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (automationLevel !== 'all') params.set('automationLevel', automationLevel);
    if (priority !== 'all') params.set('priority', priority);
    if (owner) params.set('owner', owner);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    params.set('sortField', sortField);
    params.set('sortOrder', sortOrder);
    params.set('refresh', String(refreshSignal));
    return `/api/tasks?${params.toString()}`;
  }, [automationLevel, endDate, owner, priority, refreshSignal, search, sortField, sortOrder, startDate]);

  const { data, mutate } = useSWR<TaskTableResponse>(query, fetcher);

  const handleDelete = async (taskId: number) => {
    if (!confirm('タスクを削除しますか？')) return;
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    mutate();
    onRefresh();
  };

  const handleRefresh = () => {
    mutate();
    onRefresh();
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/75 p-8 shadow-[0_30px_120px_-60px_rgba(15,23,42,0.6)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -top-20 left-12 h-48 w-48 rounded-full bg-gradient-to-br from-sky-400/25 via-indigo-400/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 translate-x-1/4 translate-y-1/4 rounded-full bg-gradient-to-br from-purple-400/20 via-fuchsia-300/15 to-transparent blur-3xl" />
      <div className="relative space-y-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">タスク一覧</h2>
            <p className="text-sm text-slate-500">
              自動化候補を一望しながら検索・フィルタ・ソートで瞬時に絞り込みます。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/70 px-4 py-2 text-xs font-semibold text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/80"
            >
              最新に更新
            </button>
            <a
              href="/api/export?format=csv"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-500"
            >
              CSVダウンロード
            </a>
            <a
              href="/api/export?format=xlsx"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-500"
            >
              Excelダウンロード
            </a>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="タスク名/目的を検索"
            className={filterInputClasses}
          />
          <select
            value={automationLevel}
            onChange={(event) => setAutomationLevel(event.target.value as AutomationLevel | 'all')}
            className={filterInputClasses}
          >
            {automationFilters.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? '自動化可能性 (すべて)' : option}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as PriorityLevel | 'all')}
            className={filterInputClasses}
          >
            {priorityFilters.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? '優先度 (すべて)' : option}
              </option>
            ))}
          </select>
          <input
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            placeholder="担当者"
            className={filterInputClasses}
          />
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={filterInputClasses}
          />
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className={filterInputClasses}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={sortField}
            onChange={(event) => setSortField(event.target.value as 'updated_at' | 'id')}
            className={clsx(filterInputClasses, 'w-full sm:w-44')}
          >
            <option value="updated_at">更新日時</option>
            <option value="id">タスクID</option>
          </select>
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}
            className={clsx(filterInputClasses, 'w-full sm:w-40')}
          >
            <option value="desc">新しい順</option>
            <option value="asc">古い順</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
          <table className="min-w-full divide-y divide-slate-200/70 text-sm">
            <thead className="bg-gradient-to-r from-slate-50 via-white to-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">タスクID</th>
                <th className="px-4 py-3 text-left">タスク名 / ゴール</th>
                <th className="px-4 py-3 text-left">自動化</th>
                <th className="px-4 py-3 text-left">担当者</th>
                <th className="px-4 py-3 text-left">更新日時</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 bg-white/90">
              {data?.tasks?.map((task) => (
                <tr key={task.id} className="group transition hover:bg-indigo-50/60">
                  <td className="px-4 py-4 text-sm font-semibold text-slate-600">#{task.id}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-slate-900">{task.task_name}</div>
                    {task.task_goal && <div className="mt-1 text-xs text-slate-500">{task.task_goal}</div>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.priority && (
                        <span
                          className={clsx(
                            'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold',
                            priorityBadge[task.priority],
                          )}
                        >
                          優先度: {task.priority}
                        </span>
                      )}
                      {task.confidentiality && (
                        <span
                          className={clsx(
                            'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold',
                            confidentialityBadge[task.confidentiality],
                          )}
                        >
                          機密性: {task.confidentiality}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {task.automation_level ? (
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold',
                          automationBadge[task.automation_level],
                        )}
                      >
                        {task.automation_level}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-slate-700">{task.tobe_owner || '未設定'}</div>
                    {task.asis_owner && <div className="text-xs text-slate-400">As-Is: {task.asis_owner}</div>}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">
                    {new Date(task.updated_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      className="inline-flex items-center rounded-full border border-rose-200/80 bg-rose-50/70 px-4 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
              {!data?.tasks?.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    条件に一致するタスクがありません。フィルタを調整して再検索してください。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
