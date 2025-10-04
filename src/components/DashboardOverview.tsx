'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { DashboardSummary } from '@/types/task';
import { fetcher } from '@/lib/fetcher';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export function DashboardOverview() {
  const { data } = useSWR<DashboardSummary>('/api/dashboard', fetcher, { refreshInterval: 60000 });

  const automationChart = useMemo(() => {
    const labels = ['◎', '△', '×'];
    const counts = labels.map((label) => data?.automationLevelCounts?.[label] ?? 0);
    return {
      labels,
      datasets: [
        {
          label: '自動化可能性',
          data: counts,
          backgroundColor: ['#22c55e', '#f97316', '#ef4444'],
        },
      ],
    };
  }, [data]);

  const priorityChart = useMemo(() => {
    const labels = ['高', '中', '低'];
    const counts = labels.map((label) => data?.priorityCounts?.[label] ?? 0);
    return {
      labels,
      datasets: [
        {
          label: '優先度別件数',
          data: counts,
          backgroundColor: ['#1d4ed8', '#6366f1', '#a855f7'],
        },
      ],
    };
  }, [data]);

  const confidentialityChart = useMemo(() => {
    const labels = ['高', '中', '低'];
    const counts = labels.map((label) => data?.confidentialityCounts?.[label] ?? 0);
    return {
      labels,
      datasets: [
        {
          label: '機密性レベル',
          data: counts,
          backgroundColor: ['#0f172a', '#475569', '#94a3b8'],
        },
      ],
    };
  }, [data]);

  const weeklyTrend = useMemo(() => {
    const labels = data?.weeklyTrend?.map((item) => item.week) ?? [];
    const counts = data?.weeklyTrend?.map((item) => item.count) ?? [];
    return {
      labels,
      datasets: [
        {
          label: '週次登録数',
          data: counts,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          tension: 0.3,
        },
      ],
    };
  }, [data]);

  const monthlyTrend = useMemo(() => {
    const labels = data?.monthlyTrend?.map((item) => item.month) ?? [];
    const counts = data?.monthlyTrend?.map((item) => item.count) ?? [];
    return {
      labels,
      datasets: [
        {
          label: '月次登録数',
          data: counts,
          backgroundColor: '#22c55e',
        },
      ],
    };
  }, [data]);

  const totalTasks = data?.totalTasks ?? 0;
  const highAutomation = data?.automationLevelCounts?.['◎'] ?? 0;
  const highAutomationRate = totalTasks ? Math.round((highAutomation / totalTasks) * 100) : 0;
  const latestWeekly = data?.weeklyTrend && data.weeklyTrend.length > 0 ? data.weeklyTrend[data.weeklyTrend.length - 1].count : 0;
  const highlightStats = [
    {
      label: '総タスク数',
      value: totalTasks.toLocaleString(),
      caption: '登録済みの自動化候補',
    },
    {
      label: '高自動化 (◎)',
      value: highAutomation.toLocaleString(),
      caption: totalTasks ? `${highAutomationRate}% の比率` : 'データ不足',
    },
    {
      label: '平均SLA',
      value: data?.averageTargetTime ? `${Math.round(data.averageTargetTime * 10) / 10}` : '—',
      caption: data?.averageTargetTime ? '設定されている目標時間' : '目標未設定',
    },
    {
      label: '直近週の登録',
      value: latestWeekly.toLocaleString(),
      caption: '週次トレンドの最新値',
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/80 p-8 shadow-[0_35px_120px_-60px_rgba(15,23,42,0.6)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -top-32 right-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-400/30 via-sky-400/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-tr from-emerald-400/25 via-teal-300/15 to-transparent blur-3xl" />
      <div className="relative space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">集計ダッシュボード</h2>
            <p className="text-sm text-slate-500">自動化率・優先度・SLAのトレンドをリアルタイムに把握します。</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-4 py-2 text-xs font-semibold text-indigo-600">
            最新更新: {new Date().toLocaleString()}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {highlightStats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/40 bg-white/70 p-5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.caption}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-inner">
            <h3 className="text-sm font-semibold text-slate-600">自動化可能性の割合</h3>
            <Pie data={automationChart} />
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-inner">
            <h3 className="text-sm font-semibold text-slate-600">優先度別タスク数</h3>
            <Bar data={priorityChart} options={{ plugins: { legend: { display: false } } }} />
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-inner">
            <h3 className="text-sm font-semibold text-slate-600">機密性レベル分布</h3>
            <Bar data={confidentialityChart} options={{ plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-inner">
            <h3 className="text-sm font-semibold text-slate-600">週次登録数推移</h3>
            <Line data={weeklyTrend} options={{ elements: { line: { tension: 0.3 } } }} />
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-inner">
            <h3 className="text-sm font-semibold text-slate-600">月次登録数推移</h3>
            <Bar data={monthlyTrend} options={{ plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>
    </section>
  );
}
