import { createClient } from '@supabase/supabase-js'

// env 변수가 없을 경우를 대비한 fallback (anon key는 공개 키이므로 안전)
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  'https://mfqdwxueigwgfnycacqb.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mcWR3eHVlaWd3Z2ZueWNhY3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTg1ODQsImV4cCI6MjA5NTczNDU4NH0.3oRSr0aNDViZPKfz-T8hpE-bc5FaW4ywJSWCirmlZVM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
