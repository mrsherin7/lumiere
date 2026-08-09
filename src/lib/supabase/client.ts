import { createBrowserClient } from '@supabase/ssr';

function getUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !url.startsWith('http')) return 'https://dummy-project.supabase.co';
  return url;
}

function getKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'dummy_key';
}

export function createClient() {
  return createBrowserClient(getUrl(), getKey());
}
