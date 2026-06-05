'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/stores/appStore';

export type UserRole = 'ADMIN' | 'LIDER' | 'DESBRAVADOR';

export interface Profile {
  id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  clube_id?: string;
  unidade_id?: string;
  membro_id?: string;
  ativo: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, nome: string, role?: UserRole) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  hasRole: (roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isLider: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setClubeAtual } = useAppStore();

  // Carregar sessão inicial
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);

          // Buscar profile
          await fetchProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Buscar profile do usuário
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && (error as any).code !== 'PGRST116') {
        console.warn('Erro ao buscar profile via query, tentando RPC fallback:', error);

        const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_profile');

        if (rpcError) {
          console.error('Erro no RPC fallback:', rpcError);
          return;
        }

        if (rpcData) {
          setProfile(rpcData as unknown as Profile);
          if ((rpcData as any)?.clube_id) {
            await loadClube((rpcData as any).clube_id);
          }
        }
        return;
      }

      // Se não encontrou profile, tentar criar um via RPC (SECURITY DEFINER)
      if (!data) {
        console.warn('Profile não encontrado, criando novo...');
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) {
          console.error('Erro ao obter usuário do auth:', userErr);
          return;
        }

        const user = userData?.user;
        if (user) {
          const nomeFromMeta = (user.user_metadata as any)?.nome || user.email?.split('@')[0] || 'Usuário';
          const roleFromMeta = (user.user_metadata as any)?.role || 'DESBRAVADOR';

          const { error: createError } = await supabase.rpc('create_user_profile', {
            p_user_id: userId,
            p_nome: nomeFromMeta,
            p_email: user.email || '',
            p_role: roleFromMeta,
          });

          if (createError) {
            console.error('Erro ao criar profile:', createError);
            return;
          }

          // Reler o profile
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (newProfile) {
            setProfile(newProfile as Profile);
            if (newProfile.clube_id) {
              await loadClube(newProfile.clube_id);
            }
          }
        }

        return;
      }

      if (data) {
        setProfile(data as Profile);
      }

      // Se o usuário tem clube associado, atualizar o store
      if (data?.clube_id) {
        await loadClube(data.clube_id);
      }
    } catch (error) {
      console.error('Erro ao buscar profile:', error);
    }
  };

  const loadClube = async (clubeId: string) => {
    try {
      const { data: clube } = await supabase
        .from('clubes')
        .select('id, nome, cidade, estado')
        .eq('id', clubeId)
        .maybeSingle();

      if (clube) {
        setClubeAtual(clube as any);
      }
    } catch (error) {
      console.error('Erro ao carregar clube:', error);
    }
  };

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) return { error };

      // Atualizar estado local imediatamente
      if (data?.user) {
        setUser(data.user as User);
      }
      if (data?.session) {
        setSession(data.session as Session);
      }

      if (data?.user?.id) {
        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Cadastro
  const signUp = async (
    email: string,
    password: string,
    nome: string,
    role: UserRole = 'DESBRAVADOR'
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            role,
          },
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Atualizar profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('Usuário não autenticado') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      // Recarregar profile
      await fetchProfile(user.id);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Verificar se tem role específica
  const hasRole = (roles: UserRole[]) => {
    if (!profile) return false;
    return roles.includes(profile.role);
  };

  // Helpers
  const isAdmin = hasRole(['ADMIN']);
  const isLider = hasRole(['ADMIN', 'LIDER']);

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user && !!session,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasRole,
    isAdmin,
    isLider,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar a autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Hook para proteger rotas (retorna true se não autenticado)
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isAuthenticated, isLoading };
}

// Hook para verificar permissões
export function usePermission(requiredRoles: UserRole[]) {
  const { hasRole, isLoading } = useAuth();

  return {
    hasPermission: hasRole(requiredRoles),
    isLoading,
  };
}