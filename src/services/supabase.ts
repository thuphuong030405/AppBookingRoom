// src/services/supabase.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Đã bỏ đoạn "/rest/v1/" ở cuối URL
const SUPABASE_URL = 'https://siijzopwojuxtailgctu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaWp6b3B3b2p1eHRhaWxnY3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMDgzNDgsImV4cCI6MjEwNjc4NDM0OH0.sxLhGDCEq-KqZ3TyWWEUW1Cqhe-w8l4wYBGF4nvwte0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});