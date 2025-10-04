import { NextResponse } from 'next/server';
import { listDependencies, listTasks } from '@/lib/tasks';

export async function GET() {
  const [tasks, dependencies] = await Promise.all([listTasks(), listDependencies()]);
  return NextResponse.json({ tasks, dependencies });
}
