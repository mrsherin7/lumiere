import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !url.startsWith('http')) return 'https://dummy-project.supabase.co';
  return url;
}

function getKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'dummy_key';
}

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'dummy_service_key';
}

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    getUrl(),
    getKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from Server Component — can be ignored if middleware handles session refresh
          }
        },
      },
    }
  );
}

export function createAdminClient() {
  return createServerClient(
    getUrl(),
    getServiceKey(),
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}
