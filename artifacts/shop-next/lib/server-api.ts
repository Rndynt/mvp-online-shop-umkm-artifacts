/**
 * Server-side API access for React Server Components. Client components must
 * keep using the generated `@workspace/api-client-react` hooks (relative
 * `/api/...` fetches, proxied by Next.js rewrites) — this helper is only for
 * SSR/SSG data fetching where there is no browser origin to resolve against.
 */

const API_ORIGIN = process.env.INTERNAL_API_ORIGIN ?? 'http://127.0.0.1:8080';

export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_ORIGIN}/api${path}`, {
      ...init,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: T };
    return json.data;
  } catch {
    return null;
  }
}
