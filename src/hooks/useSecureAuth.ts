import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { emailSchema, passwordSchema, phoneSchema, nameSchema } from '@/lib/validation';

export const useSecureAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Validate inputs
      const validEmail = emailSchema.parse(email);
      const validPassword = passwordSchema.parse(password);
      const validName = nameSchema.parse(name);

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: validEmail,
        password: validPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: validName,
            firstName: validName.split(' ')[0] || '',
            lastName: validName.split(' ').slice(1).join(' ') || ''
          }
        }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { data: null, error: error.message || 'Sign up failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Validate inputs
      const validEmail = emailSchema.parse(email);
      const validPassword = passwordSchema.parse(password);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validEmail,
        password: validPassword,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { data: null, error: error.message || 'Sign in failed' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: error.message || 'Sign out failed' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const validEmail = emailSchema.parse(email);
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(validEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { error: error.message || 'Password reset failed' };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const validPassword = passwordSchema.parse(newPassword);

      const { error } = await supabase.auth.updateUser({
        password: validPassword
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      return { error: error.message || 'Password update failed' };
    }
  };

  const updateProfile = async (updates: { email?: string; phone?: string; data?: any }) => {
    try {
      const validatedUpdates: any = {};

      if (updates.email) {
        validatedUpdates.email = emailSchema.parse(updates.email);
      }

      if (updates.phone) {
        validatedUpdates.phone = phoneSchema.parse(updates.phone);
      }

      if (updates.data) {
        validatedUpdates.data = updates.data;
      }

      const { error } = await supabase.auth.updateUser(validatedUpdates);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { error: error.message || 'Profile update failed' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { error: error.message || 'Google sign in failed' };
    }
  };

  return {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    signInWithGoogle,
  };
};