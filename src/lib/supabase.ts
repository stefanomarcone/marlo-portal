import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://swhoyyqcrrnetrqntimn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aG95eXFjcnJuZXRycW50aW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzQ5NjksImV4cCI6MjA5MTExMDk2OX0.xYsff7Qll20IvdL_Y9viZvgYZW_p-MZj8vknnoXpeKc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const SUPABASE_URL = supabaseUrl;
