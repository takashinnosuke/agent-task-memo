export type AutomationLevel = '◎' | '△' | '×';
export type OwnerType = 'エージェント' | '人間' | '共同';
export type ConfidentialityLevel = '高' | '中' | '低';
export type PriorityLevel = '高' | '中' | '低';
export type TargetTimeUnit = '秒' | '分' | '時間';

export interface Task {
  id: number;
  task_name: string;
  task_goal?: string | null;
  automation_level?: AutomationLevel | null;
  tobe_owner?: OwnerType | null;
  input_info?: string | null;
  output_info?: string | null;
  data_standard?: string | null;
  trigger_event?: string | null;
  asis_owner?: string | null;
  agent_capability?: string | null;
  tools_systems?: string | null;
  exception_cases?: string | null;
  error_handling?: string | null;
  target_time?: number | null;
  target_time_unit?: TargetTimeUnit | null;
  confidentiality?: ConfidentialityLevel | null;
  audit_log_required?: boolean | null;
  learning_mechanism?: string | null;
  kpi_metrics?: string | null;
  cost_benefit?: number | null;
  comments?: string | null;
  priority?: PriorityLevel | null;
  created_at: string;
  updated_at: string;
}

export interface TaskDependency {
  id: number;
  task_id: number;
  depends_on_task_id: number;
}

export interface QuickMemo {
  id: number;
  task_id?: number | null;
  task_name?: string | null;
  memo_content: string;
  created_at: string;
}

export interface TaskFilters {
  automationLevel?: AutomationLevel | 'all';
  priority?: PriorityLevel | 'all';
  owner?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortField?: 'updated_at' | 'id';
  sortOrder?: 'asc' | 'desc';
}

export interface TrendPoint {
  label: string;
  count: number;
}

export interface DashboardSummary {
  totalTasks: number;
  automationLevelCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  confidentialityCounts: Record<string, number>;
  averageTargetTime?: number | null;
  weeklyTrend: { week: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}
