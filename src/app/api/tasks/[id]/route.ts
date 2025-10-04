import { NextRequest, NextResponse } from 'next/server';
import { baseTaskSchema, dependencySchema } from '@/utils/validation';
import { deleteTask, getTask, updateTask, upsertDependencies } from '@/lib/tasks';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const taskId = Number(params.id);
  const task = await getTask(taskId);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json({ task });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const taskId = Number(params.id);
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
  { params }: { params: { id: string } },
) {
  const taskId = Number(params.id);
  await deleteTask(taskId);
  return NextResponse.json({ ok: true });
}
