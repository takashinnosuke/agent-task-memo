'use client';

import { useCallback, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { QuickMemoPanel } from './QuickMemoPanel';
import { TaskFormWizard } from './TaskFormWizard';
import { TaskTable } from './TaskTable';
import { DashboardOverview } from './DashboardOverview';
import { DependencyGraph } from './DependencyGraph';
import { fetcher } from '@/lib/fetcher';
import { QuickMemo, Task } from '@/types/task';

interface QuickMemoResponse {
  memos: QuickMemo[];
}

interface TaskResponse {
  tasks: Task[];
}

export function AppShell() {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { mutate } = useSWRConfig();
  const { data: memoData, mutate: mutateMemos } = useSWR<QuickMemoResponse>('/api/quick-memos', fetcher);
  const { data: taskData, mutate: mutateTasks } = useSWR<TaskResponse>(
    `/api/tasks?sortField=id&sortOrder=asc&refresh=${refreshCounter}`,
    fetcher,
  );

  const triggerGlobalRefresh = useCallback(() => {
    setRefreshCounter((count) => count + 1);
    mutateTasks();
    mutate('/api/dashboard');
    mutate('/api/dependencies');
  }, [mutate, mutateTasks]);

  return (
    <div className="space-y-12">
      <QuickMemoPanel
        memos={memoData?.memos ?? []}
        onRefresh={() => {
          mutateMemos();
        }}
      />
      <TaskFormWizard
        tasks={taskData?.tasks ?? []}
        onCreated={() => {
          triggerGlobalRefresh();
        }}
      />
      <TaskTable
        refreshSignal={refreshCounter}
        onRefresh={() => {
          triggerGlobalRefresh();
        }}
      />
      <DashboardOverview />
      <DependencyGraph />
    </div>
  );
}
