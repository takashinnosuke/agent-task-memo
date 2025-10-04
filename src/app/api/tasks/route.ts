import { NextRequest, NextResponse } from 'next/server';
import { baseTaskSchema } from '@/utils/validation';
import { createTask, listTasks } from '@/lib/tasks';
import { TaskFilters } from '@/types/task';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const filters: TaskFilters = {
    search: searchParams.get('q') || undefined,
    automationLevel: (searchParams.get('automationLevel') as TaskFilters['automationLevel']) || undefined,
    priority: (searchParams.get('priority') as TaskFilters['priority']) || undefined,
    owner: searchParams.get('owner') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    sortField: (searchParams.get('sortField') as TaskFilters['sortField']) || undefined,
    sortOrder: (searchParams.get('sortOrder') as TaskFilters['sortOrder']) || undefined,
  };

  const tasks = await listTasks(filters);
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = baseTaskSchema.parse(body);
    const newId = await createTask(parsed);
    return NextResponse.json({ id: newId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create task' },
      { status: 400 },
    );
  }
}
