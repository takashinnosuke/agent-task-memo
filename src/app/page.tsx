import { AppShell } from '@/components/AppShell';

export default function Home() {
  const highlightCards = [
    {
      title: '3秒でアイデアを捕捉',
      description: 'フォーカス済みのクイックメモでひらめきを逃さない。',
    },
    {
      title: '22項目の設計ウィザード',
      description: '優先度に沿って段階的にタスクを深堀り。',
    },
    {
      title: 'ダッシュボードで即可視化',
      description: '自動化率やSLAをリアルタイムに俯瞰。',
    },
  ];

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-12 px-4 py-12 sm:px-8">
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-10 text-slate-100 shadow-[0_45px_120px_-60px_rgba(15,23,42,0.9)]">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/30 via-sky-400/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-52 w-52 rounded-full bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent blur-3xl" />
        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Agent Ops Design Studio
              </span>
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                エージェント業務設計メモ
              </h1>
              <p className="max-w-2xl text-sm text-slate-200 sm:text-base">
                タスクの自動化構想をスピーディーに記録し、詳細設計・依存関係・ダッシュボードまでをワンストップで管理するワークスペースです。
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 text-xs sm:text-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 font-medium">
                <span className="rounded-full bg-indigo-500/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                  MVP
                </span>
                Next.js + SQLite / Vercel Postgres
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-200">
                連続入力対応・ショートカット保存
              </span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {highlightCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/10 p-5 text-sm text-slate-100 backdrop-blur-md transition hover:border-white/30 hover:bg-white/15"
              >
                <p className="text-sm font-semibold text-white">{card.title}</p>
                <p className="mt-1 text-xs text-slate-200">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </header>
      <AppShell />
    </main>
  );
}
