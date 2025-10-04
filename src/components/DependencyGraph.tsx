'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import mermaid from 'mermaid';
import { fetcher } from '@/lib/fetcher';
import { Task, TaskDependency } from '@/types/task';

interface DependencyResponse {
  tasks: Task[];
  dependencies: TaskDependency[];
}

mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });

function buildMermaid(tasks: Task[], dependencies: TaskDependency[]): string {
  if (!tasks.length) {
    return 'graph TD\n  Empty["タスクがまだ登録されていません"]';
  }
  const lines = ['graph TD'];
  tasks.forEach((task) => {
    const label = `${task.id}: ${task.task_name}`.replaceAll('"', '\"');
    lines.push(`  T${task.id}["${label}"]`);
  });
  const adjacency = new Map<number, number[]>();
  dependencies.forEach((dependency) => {
    const list = adjacency.get(dependency.depends_on_task_id) ?? [];
    list.push(dependency.task_id);
    adjacency.set(dependency.depends_on_task_id, list);
  });

  const memo = new Map<number, { length: number; path: number[] }>();

  function dfs(node: number, visited = new Set<number>()): { length: number; path: number[] } {
    if (memo.has(node)) return memo.get(node)!;
    if (visited.has(node)) return { length: 0, path: [node] };
    visited.add(node);
    const neighbors = adjacency.get(node) ?? [];
    if (!neighbors.length) {
      const result = { length: 1, path: [node] };
      memo.set(node, result);
      visited.delete(node);
      return result;
    }
    let best: { length: number; path: number[] } = { length: 1, path: [node] };
    neighbors.forEach((neighbor) => {
      const candidate = dfs(neighbor, visited);
      if (candidate.length + 1 > best.length) {
        best = { length: candidate.length + 1, path: [node, ...candidate.path] };
      }
    });
    memo.set(node, best);
    visited.delete(node);
    return best;
  }

  let criticalPath: number[] = [];
  tasks.forEach((task) => {
    const result = dfs(task.id);
    if (result.length > criticalPath.length) {
      criticalPath = result.path;
    }
  });

  const edgeStyles: string[] = [];

  dependencies.forEach((dependency, index) => {
    lines.push(`  T${dependency.depends_on_task_id} --> T${dependency.task_id}`);
    if (isCriticalEdge(criticalPath, dependency.depends_on_task_id, dependency.task_id)) {
      edgeStyles.push(`linkStyle ${index} stroke:#dc2626,stroke-width:3px;`);
    }
  });

  if (criticalPath.length > 1) {
    const criticalNodes = criticalPath.map((id) => `T${id}`).join(', ');
    lines.push('  classDef critical fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#b91c1c;');
    lines.push(`  class ${criticalNodes} critical;`);
  }

  edgeStyles.forEach((style) => lines.push(`  ${style}`));
  return lines.join('\n');
}

function isCriticalEdge(path: number[], from: number, to: number) {
  for (let i = 0; i < path.length - 1; i += 1) {
    if (path[i] === from && path[i + 1] === to) {
      return true;
    }
  }
  return false;
}

export function DependencyGraph() {
  const { data } = useSWR<DependencyResponse>('/api/dependencies', fetcher, { refreshInterval: 60000 });
  const [svg, setSvg] = useState('');

  const definition = useMemo(
    () => buildMermaid(data?.tasks ?? [], data?.dependencies ?? []),
    [data?.dependencies, data?.tasks],
  );

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const { svg } = await mermaid.render('dependency-graph', definition);
        if (!cancelled) {
          setSvg(svg);
        }
      } catch (error) {
        console.error('Mermaid rendering failed', error);
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [definition]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/75 p-8 shadow-[0_30px_120px_-60px_rgba(15,23,42,0.6)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -top-16 right-10 h-48 w-48 rounded-full bg-gradient-to-br from-violet-400/25 via-indigo-400/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-60 w-60 -translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-tr from-sky-400/20 via-teal-300/15 to-transparent blur-3xl" />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">タスク依存関係の可視化</h2>
            <p className="text-sm text-slate-500">Mermaidフローチャートでクリティカルパスを俯瞰し、ボトルネックを把握します。</p>
          </div>
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(definition)}`}
            download="task-dependency.mmd"
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/70 px-4 py-2 text-xs font-semibold text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/80"
          >
            Mermaidをダウンロード
          </a>
        </div>
        <div className="overflow-x-auto">
          <div
            className="min-w-full rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-inner"
            dangerouslySetInnerHTML={{
              __html:
                svg ||
                '<p class="text-sm text-slate-500">グラフを生成中です。タスクと依存関係を登録すると自動で描画されます。</p>',
            }}
          />
        </div>
      </div>
    </section>
  );
}
