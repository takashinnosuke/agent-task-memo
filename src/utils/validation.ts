import { z } from 'zod';

export const quickMemoSchema = z.object({
  taskId: z.number().optional().nullable(),
  taskName: z.string().min(1, 'タスク名を入力してください').optional(),
  memoContent: z.string().min(1, 'メモ内容は必須です'),
});

export const baseTaskSchema = z.object({
  task_name: z.string().min(1, 'タスク名は必須です'),
  task_goal: z.string().min(1, '目的/ゴールは必須です'),
  automation_level: z.enum(['◎', '△', '×'], {
    errorMap: () => ({ message: '自動化可能性を選択してください' }),
  }),
  tobe_owner: z.enum(['エージェント', '人間', '共同'], {
    errorMap: () => ({ message: 'To-Be担当者を選択してください' }),
  }),
  input_info: z.string().min(1, '入力情報は必須です'),
  output_info: z.string().min(1, '出力情報は必須です'),
  data_standard: z.string().optional().nullable(),
  trigger_event: z.string().optional().nullable(),
  asis_owner: z.string().optional().nullable(),
  agent_capability: z.string().optional().nullable(),
  tools_systems: z.string().optional().nullable(),
  exception_cases: z.string().optional().nullable(),
  error_handling: z.string().optional().nullable(),
  target_time: z.number().int().positive().optional().nullable(),
  target_time_unit: z.enum(['秒', '分', '時間']).optional().nullable(),
  confidentiality: z.enum(['高', '中', '低']).optional().nullable(),
  audit_log_required: z.boolean().optional().nullable(),
  learning_mechanism: z.string().optional().nullable(),
  kpi_metrics: z.string().optional().nullable(),
  cost_benefit: z.number().optional().nullable(),
  comments: z.string().optional().nullable(),
  priority: z.enum(['高', '中', '低']).optional().nullable(),
});

export const dependencySchema = z.object({
  taskId: z.number().int(),
  dependsOn: z.array(z.number().int()).default([]),
});

export type TaskInput = z.infer<typeof baseTaskSchema>;
