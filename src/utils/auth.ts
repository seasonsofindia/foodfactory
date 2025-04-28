
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

let currentUser: AuthUser | null = null;

export const login = async (email: string, password: string): Promise<AuthUser> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !data) {
    throw new Error('Invalid credentials');
  }

  currentUser = {
    id: data.id,
    email: data.email,
    role: data.role || 'user'
  };

  localStorage.setItem('auth_user', JSON.stringify(currentUser));
  return currentUser;
};

export const logout = () => {
  currentUser = null;
  localStorage.removeItem('auth_user');
};

export const getCurrentUser = (): AuthUser | null => {
  if (currentUser) return currentUser;
  
  const stored = localStorage.getItem('auth_user');
  if (stored) {
    currentUser = JSON.parse(stored);
    return currentUser;
  }
  
  return null;
};

export const isAdmin = (): boolean => {
  return getCurrentUser()?.role === 'admin';
};
