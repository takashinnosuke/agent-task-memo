'use client';

import { useMemo, useState } from 'react';
import clsx from 'classnames';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { baseTaskSchema } from '@/utils/validation';
import { Task } from '@/types/task';

interface TaskFormWizardProps {
  tasks: Task[];
  onCreated: () => void;
}

const formSchema = baseTaskSchema.extend({
  dependency_task_ids: z.array(z.number().int()).default([]),
  tools_systems_tags: z.array(z.string()).default([]),
  kpi_metrics_tags: z.array(z.string()).default([]),
});

type FormValues = z.input<typeof formSchema>;

const steps = [
  {
    id: 'high',
    title: '基本情報 (優先度:高)',
    description: 'タスクの核となる情報を素早く整理します。',
  },
  {
    id: 'medium',
    title: '運用設計 (優先度:中)',
    description: '運用条件や制約を整理します。',
  },
  {
    id: 'low',
    title: '詳細情報 (優先度:低)',
    description: '将来的な改善や監査向けの情報を記録します。',
  },
];

const ownerOptions = ['エージェント', '人間', '共同'] as const;
const automationOptions = ['◎', '△', '×'] as const;
const confidentialityOptions = ['高', '中', '低'] as const;
const priorityOptions = ['高', '中', '低'] as const;
const timeUnitOptions = ['秒', '分', '時間'] as const;

const labelClasses = 'block text-xs font-semibold uppercase tracking-wide text-slate-500';
const baseInputClasses =
  'w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm shadow-[0_12px_40px_-18px_rgba(15,23,42,0.25)] transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 placeholder:text-slate-400 backdrop-blur-sm';
const textAreaClasses = `${baseInputClasses} min-h-[128px] leading-relaxed`;
const multiSelectClasses = `${baseInputClasses} h-40`;
const disabledFieldClasses = 'mt-2 w-full rounded-2xl border border-dashed border-slate-300/70 bg-slate-100/70 px-4 py-3 text-sm text-slate-400';
const checkboxClasses = 'h-4 w-4 rounded border border-slate-300 text-indigo-500 focus:ring-indigo-400 focus:ring-offset-0';

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function TaskFormWizard({ tasks, onCreated }: TaskFormWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues: FormValues = {
    task_name: '',
    task_goal: '',
    automation_level: '◎',
    tobe_owner: 'エージェント',
    input_info: '',
    output_info: '',
    data_standard: '',
    trigger_event: '',
    dependency_task_ids: [],
    agent_capability: '',
    tools_systems: '',
    tools_systems_tags: [],
    exception_cases: '',
    error_handling: '',
    target_time: undefined,
    target_time_unit: '分',
    confidentiality: '中',
    audit_log_required: false,
    learning_mechanism: '',
    kpi_metrics: '',
    kpi_metrics_tags: [],
    cost_benefit: undefined,
    comments: '',
    priority: '中',
    asis_owner: '',
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const dependencyOptions = useMemo(
    () =>
      tasks.map((task) => ({
        value: task.id,
        label: `${task.id}: ${task.task_name}`,
      })),
    [tasks],
  );

  const goNext = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  };

  const goPrev = () => setStepIndex((index) => Math.max(index - 1, 0));

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSaving(true);
      setSubmitError(null);
      const dependency_task_ids = values.dependency_task_ids ?? [];
      const tools_systems_tags = values.tools_systems_tags ?? [];
      const kpi_metrics_tags = values.kpi_metrics_tags ?? [];
      const { dependency_task_ids: _ignoredDependencyIds, tools_systems_tags: _ignoredToolsTags, kpi_metrics_tags: _ignoredKpiTags, ...taskPayload } = values;

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskPayload,
          tools_systems: tools_systems_tags.join(', '),
          kpi_metrics: kpi_metrics_tags.join(', '),
        }),
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'タスクの作成に失敗しました');
      }
      const { id } = await response.json();
      if (dependency_task_ids.length) {
        await fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dependsOn: dependency_task_ids }),
        });
      }
      form.reset();
      setStepIndex(0);
      onCreated();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'タスクの保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  });

  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/80 p-10 shadow-[0_35px_120px_-60px_rgba(15,23,42,0.65)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/30 via-sky-300/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-tr from-violet-400/20 via-fuchsia-300/15 to-transparent blur-3xl" />
      <div className="relative space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">タスク詳細入力</h2>
            <p className="text-sm text-slate-500">
              優先度に合わせて22項目をステップでガイド。自動化アイデアを構造化して設計に落とし込みます。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setStepIndex(index)}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition',
                  index === stepIndex
                    ? 'border-transparent bg-gradient-to-r from-indigo-500 via-sky-500 to-teal-400 text-white shadow-lg shadow-indigo-200/40'
                    : 'border-slate-200 bg-white/60 text-slate-500 hover:border-indigo-200 hover:text-indigo-500',
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-[11px] font-bold text-indigo-600">
                  {index + 1}
                </span>
                {step.title}
              </button>
            ))}
          </div>
        </div>
        <div className="relative h-2 rounded-full bg-slate-200/80">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400"
            style={{ width: `${progress}%` }}
          />
        </div>

        <form className="space-y-10" onSubmit={handleSubmit}>
          {submitError && (
            <p className="rounded-2xl border border-red-200/60 bg-red-50/80 px-5 py-3 text-sm text-red-600 shadow-sm">
              {submitError}
            </p>
          )}
          {stepIndex === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClasses}>タスク名 *</label>
              <input
                {...form.register('task_name')}
                className={clsx(baseInputClasses, 'mt-2')}
              />
              {form.formState.errors.task_name && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.task_name.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={labelClasses}>タスクの目的 / ゴール *</label>
              <textarea
                {...form.register('task_goal')}
                className={clsx(textAreaClasses, 'mt-2')}
                rows={3}
              />
              {form.formState.errors.task_goal && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.task_goal.message}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>自動化可能性 *</label>
              <select
                {...form.register('automation_level')}
                className={clsx(baseInputClasses, 'mt-2')}
              >
                {automationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {form.formState.errors.automation_level && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.automation_level.message as string}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>To-Be担当者 / 役割 *</label>
              <select
                {...form.register('tobe_owner')}
                className={clsx(baseInputClasses, 'mt-2')}
              >
                {ownerOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {form.formState.errors.tobe_owner && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.tobe_owner.message as string}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>入力情報 *</label>
              <textarea
                {...form.register('input_info')}
                rows={3}
                className={clsx(textAreaClasses, 'mt-2')}
              />
              {form.formState.errors.input_info && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.input_info.message}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>出力情報 *</label>
              <textarea
                {...form.register('output_info')}
                rows={3}
                className={clsx(textAreaClasses, 'mt-2')}
              />
              {form.formState.errors.output_info && (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.output_info.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={labelClasses}>データ標準化要件 *</label>
              <textarea
                {...form.register('data_standard')}
                rows={2}
                className={clsx(textAreaClasses, 'mt-2')}
              />
            </div>
            <div>
              <label className={labelClasses}>トリガー</label>
              <input
                {...form.register('trigger_event')}
                className={clsx(baseInputClasses, 'mt-2')}
              />
            </div>
            <div>
              <label className={labelClasses}>依存タスク</label>
              <Controller
                control={form.control}
                name="dependency_task_ids"
                render={({ field }) => (
                  <select
                    multiple
                    value={(field.value ?? []).map(String)}
                    onChange={(event) => {
                      const selected = Array.from(event.target.selectedOptions).map((option) => Number(option.value));
                      field.onChange(selected);
                    }}
                    className={clsx(multiSelectClasses, 'mt-2')}
                  >
                    {dependencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>
        )}

          {stepIndex === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClasses}>エージェントの能力 / 制約</label>
              <textarea
                {...form.register('agent_capability')}
                rows={3}
                className={clsx(textAreaClasses, 'mt-2')}
              />
            </div>
            <div>
              <label className={labelClasses}>使用ツール / システム (カンマ区切り)</label>
              <Controller
                control={form.control}
                name="tools_systems_tags"
                render={({ field }) => (
                  <input
                    value={(field.value ?? []).join(', ')}
                    onChange={(event) => field.onChange(parseTags(event.target.value))}
                    placeholder="例: Slack, Notion"
                    className={clsx(baseInputClasses, 'mt-2')}
                  />
                )}
              />
            </div>
            <div>
              <label className={labelClasses}>例外処理 / エラーケース</label>
              <textarea
                {...form.register('exception_cases')}
                rows={3}
                className={clsx(textAreaClasses, 'mt-2')}
              />
            </div>
            <div>
              <label className={labelClasses}>エラー時の対応</label>
              <textarea
                {...form.register('error_handling')}
                rows={3}
                className={clsx(textAreaClasses, 'mt-2')}
              />
            </div>
            <div>
              <label className={labelClasses}>目標完了時間 / SLA</label>
              <div className="mt-2 flex flex-wrap gap-3 sm:flex-nowrap">
                <input
                  type="number"
                  {...form.register('target_time', {
                    setValueAs: (value) => (value === '' || value === null ? undefined : Number(value)),
                  })}
                  className={clsx(baseInputClasses, 'flex-1')}
                />
                <select
                  {...form.register('target_time_unit')}
                  className={clsx(baseInputClasses, 'w-full sm:w-32')}
                >
                  {timeUnitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClasses}>機密性レベル</label>
              <select
                {...form.register('confidentiality')}
                className={clsx(baseInputClasses, 'mt-2')}
              >
                {confidentialityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-3">
              <input type="checkbox" id="audit" {...form.register('audit_log_required')} className={checkboxClasses} />
              <label htmlFor="audit" className="text-sm font-medium text-slate-600">
                監査証跡 / ログ要件あり
              </label>
            </div>
          </div>
        )}

          {stepIndex === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClasses}>タスクID (自動採番)</label>
              <input
                value="自動採番"
                disabled
                className={disabledFieldClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>担当者 / 役割 (As-Is)</label>
              <input
                {...form.register('asis_owner')}
                className={clsx(baseInputClasses, 'mt-2')}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClasses}>コメント</label>
              <textarea
                {...form.register('comments')}
                rows={2}
                className={clsx(textAreaClasses, 'mt-2')}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClasses}>学習 / 改善メカニズム</label>
              <textarea
                {...form.register('learning_mechanism')}
                rows={2}
                className={clsx(textAreaClasses, 'mt-2')}
              />
            </div>
            <div>
              <label className={labelClasses}>費用対効果 / 導入コスト</label>
              <input
                type="number"
                step="0.01"
                {...form.register('cost_benefit', {
                  setValueAs: (value) => (value === '' || value === null ? undefined : Number(value)),
                })}
                className={clsx(baseInputClasses, 'mt-2')}
              />
            </div>
            <div>
              <label className={labelClasses}>パフォーマンス指標 (KPI) カンマ区切り</label>
              <Controller
                control={form.control}
                name="kpi_metrics_tags"
                render={({ field }) => (
                  <input
                    value={(field.value ?? []).join(', ')}
                    onChange={(event) => field.onChange(parseTags(event.target.value))}
                    placeholder="例: 処理件数, 応答時間"
                    className={clsx(baseInputClasses, 'mt-2')}
                  />
                )}
              />
            </div>
            <div>
              <label className={labelClasses}>優先度</label>
              <select
                {...form.register('priority')}
                className={clsx(baseInputClasses, 'mt-2')}
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={stepIndex === 0}
            className="rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-500 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
          >
            戻る
          </button>
          {stepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-300/40 transition hover:brightness-110"
            >
              次へ
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-300/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? '保存中...' : 'タスクを保存'}
            </button>
          )}
        </div>
        </form>
      </div>
    </section>
  );
}
