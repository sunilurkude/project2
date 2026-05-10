import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable.\n' +
    'Create a .env file in the project root with:\n' +
    'VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}
if (!supabaseKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY environment variable.\n' +
    'Set it in your .env file or Vercel project environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
