import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import { listTasks } from '@/lib/tasks';
import type { Task } from '@/types/task';
import * as XLSX from 'xlsx';

function buildCsv(rows: Task[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0] as Record<string, unknown>);
  const escape = (value: unknown) => {
    if (value === null || value === undefined) return '';
    const str = String(value).replace(/"/g, '""');
    return /[",\n]/.test(str) ? `"${str}"` : str;
  };
  const lines = [headers.join(',')];
  rows.forEach((row) => {
    const record = row as Record<string, unknown>;
    lines.push(headers.map((header) => escape(record[header])).join(','));
  });
  return lines.join('\n');
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const format = searchParams.get('format') ?? 'csv';
  const tasks = await listTasks();

  if (format === 'xlsx') {
    const worksheet = XLSX.utils.json_to_sheet(tasks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
    const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="tasks.xlsx"',
      },
    });
  }

  const csv = buildCsv(tasks);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="tasks.csv"',
    },
  });
}
