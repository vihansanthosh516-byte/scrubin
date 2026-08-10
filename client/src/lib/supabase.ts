import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://ewtwxcjshdejwpxeroeg.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dHd4Y2pzaGRlandweGVyb2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMjY1MzIsImV4cCI6MjEwMTYwMjUzMn0.lxXB_n2H1MlFboJgPfGcMGihCEAhW1qU1yAhGWTh0hg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
