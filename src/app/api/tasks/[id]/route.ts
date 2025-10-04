import { NextRequest, NextResponse } from 'next/server';
import { baseTaskSchema, dependencySchema } from '@/utils/validation';
import { deleteTask, getTask, updateTask, upsertDependencies } from '@/lib/tasks';

type RouteParams = { id: string };

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  const { id } = await params;
  const taskId = Number(id);
  const task = await getTask(taskId);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json({ task });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    const { id } = await params;
    const taskId = Number(id);
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
  { params }: { params: Promise<RouteParams> },
) {
  const { id } = await params;
  const taskId = Number(id);
  await deleteTask(taskId);
  return NextResponse.json({ ok: true });
}
