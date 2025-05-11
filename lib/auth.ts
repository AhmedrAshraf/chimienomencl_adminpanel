import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export async function signIn(email: string, password: string) {
  try {
    // First, sign in the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // Then check if the email exists in the admin table
    const { data: adminData, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('email', email)
      .single();

    if (adminError || !adminData) {
      console.error('Admin check error:', adminError);
      // If user is not an admin, sign them out
      await supabase.auth.signOut();
      throw new Error('You are not authorized as an admin');
    }

    return { data: authData, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
}