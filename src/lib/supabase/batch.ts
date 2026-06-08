export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function batchInQuery<T>(
  buildQuery: (ids: string[]) => Promise<{ data: T[] | null; error: any }>,
  ids: string[],
  chunkSize = 50,
): Promise<T[]> {
  if (ids.length === 0) return [];
  const chunks = chunkArray(ids, chunkSize);
  const results = await Promise.all(chunks.map(chunk => buildQuery(chunk)));
  return results.flatMap(r => r.data || []);
}
