import { NextResponse } from 'next/server';
import { createQuickMemo, listQuickMemos } from '@/lib/tasks';
import { quickMemoSchema } from '@/utils/validation';

export async function GET() {
  const memos = await listQuickMemos();
  return NextResponse.json({ memos });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = quickMemoSchema.parse(body);
    const memoId = await createQuickMemo({
      taskId: parsed.taskId,
      taskName: parsed.taskName,
      memoContent: parsed.memoContent,
    });
    const memos = await listQuickMemos();
    return NextResponse.json({ memoId, memos }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create quick memo' },
      { status: 400 },
    );
  }
}
