import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      // If email is not found in admin table, sign them out
      await supabase.auth.signOut();
      throw new Error('You are not authorized as an admin');
    }

    return { data: authData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (user) {
      // Check if the user's email is still in the admin table
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .single();

      if (adminError || !adminData) {
        // If email is no longer in admin table, sign them out
        await supabase.auth.signOut();
        return { user: null, error: new Error('Admin access revoked') };
      }
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
} 