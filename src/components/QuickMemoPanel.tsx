'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'classnames';
import useSWRMutation from 'swr/mutation';
import { QuickMemo } from '@/types/task';

interface QuickMemoPanelProps {
  memos: QuickMemo[];
  onRefresh: () => void;
}

async function saveMemo(url: string, { arg }: { arg: { taskName: string; memoContent: string } }) {
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  return true;
}

export function QuickMemoPanel({ memos, onRefresh }: QuickMemoPanelProps) {
  const [taskName, setTaskName] = useState('');
  const [memoContent, setMemoContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { trigger, isMutating } = useSWRMutation('/api/quick-memos', saveMemo);
  const [error, setError] = useState<string | null>(null);
  const inputClass =
    'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100 placeholder:text-indigo-200/70 shadow-lg shadow-indigo-900/20 backdrop-blur focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-sky-300/50';
  const textareaClass = `${inputClass} h-36 resize-none leading-relaxed`;

  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!taskName.trim() || !memoContent.trim()) {
      setError('タスク名とメモは必須です');
      return;
    }
    try {
      setError(null);
      await trigger({ taskName: taskName.trim(), memoContent: memoContent.trim() });
      setMemoContent('');
      setTaskName('');
      textareaRef.current?.focus();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    }
  }, [memoContent, onRefresh, taskName, trigger]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleSubmit();
      }
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const memoItems = useMemo(
    () =>
      memos.map((memo) => (
        <li
          key={memo.id}
          className="group relative flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/10 p-4 text-slate-100 shadow-lg shadow-indigo-900/20 backdrop-blur transition hover:border-sky-200/40 hover:bg-white/15"
        >
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-indigo-200/80">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300/80" />
              {memo.task_name ? memo.task_name : '単独メモ'}
            </span>
            <time>{new Date(memo.created_at).toLocaleString()}</time>
          </div>
          {memo.task_name && (
            <p className="text-sm font-semibold text-white/90">#{memo.task_id ?? '—'} {memo.task_name}</p>
          )}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100/90">{memo.memo_content}</p>
        </li>
      )),
    [memos],
  );

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-8 text-slate-100 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.9)]">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_10%_20%,rgba(125,211,252,0.4),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_30%,rgba(167,139,250,0.35),transparent_55%)]" />
      <div className="relative">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">クイックメモ</h2>
            <p className="text-sm text-indigo-100/80">Enter / Ctrl + S で即保存。フォーカスは入力欄にキープされます。</p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-indigo-100/90">
            {memos.length ? `最近のメモ ${memos.length} 件` : '最初のメモを作成しましょう'}
          </span>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={taskName}
              onChange={(event) => setTaskName(event.target.value)}
              className={inputClass}
              placeholder="タスク名"
            />
            <textarea
              ref={textareaRef}
              value={memoContent}
              onChange={(event) => setMemoContent(event.target.value)}
              onKeyDown={handleKeyDown}
              className={clsx(textareaClass, error && 'border-red-400/60 focus:ring-red-300/60')}
              placeholder="メモ内容 (Enter または Ctrl+S で保存)"
            />
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isMutating}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isMutating ? '保存中...' : 'メモを保存'}
            </button>
          </div>
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {memos.length ? (
              <ul className="space-y-3">{memoItems}</ul>
            ) : (
              <div className="flex h-full min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-center text-sm text-indigo-100/80 backdrop-blur">
                <p>まだメモがありません。</p>
                <p className="mt-1 text-xs">アイデアを入力して Enter で保存してみましょう。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
