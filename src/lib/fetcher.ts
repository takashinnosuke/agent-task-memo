export async function fetcher<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Failed to fetch');
  }
  return res.json();
}
