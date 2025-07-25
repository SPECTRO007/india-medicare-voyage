// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://brecacsjupkqnxodjkuc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWNhY3NqdXBrcW54b2Rqa3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMjc0NzQsImV4cCI6MjA2ODcwMzQ3NH0.irRFhVJv8UY-1V2WIMA-lY3FLsBjNDXOaNt8eX0Mzdw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});