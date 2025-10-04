import { NextRequest, NextResponse } from 'next/server';
import { baseTaskSchema, dependencySchema } from '@/utils/validation';
import { deleteTask, getTask, updateTask, upsertDependencies } from '@/lib/tasks';

type RouteParams = { id: string };
type RouteContext = { params: Promise<RouteParams> };

async function parseTaskId(context: RouteContext) {
  const { id } = await context.params;
  return Number(id);
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const taskId = await parseTaskId(context);
  const task = await getTask(taskId);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json({ task });
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const taskId = await parseTaskId(context);
    const body = await request.json();
    const { dependsOn, ...rest } = body;
    const parsed = baseTaskSchema.partial().parse(rest);
    await updateTask(taskId, parsed);

    if (dependsOn) {
      const dependencyPayload = dependencySchema.parse({ taskId, dependsOn });
      await upsertDependencies(dependencyPayload.taskId, dependencyPayload.dependsOn);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update task' },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  const taskId = await parseTaskId(context);
  await deleteTask(taskId);
  return NextResponse.json({ ok: true });
}
