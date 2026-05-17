'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { AppSelect } from '@/components/ui/AppSelect';
import { useToast } from '@/components/ui/Toast';
import { useAuth, UserRole } from '@/hooks';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; nome?: string }>({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('DESBRAVADOR');
  const { addToast } = useToast();
  const { signIn, signUp } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; nome?: string } = {};

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (isRegistering && !nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isRegistering) {
        if (password.length < 8) {
          addToast({
            type: 'error',
            title: 'Senha muito curta',
            message: 'A senha deve ter pelo menos 8 caracteres',
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, nome, selectedRole);

        if (error) {
          console.error('Signup error:', error);
          let errorMessage = error.message;
          if (error.message.includes('already registered')) {
            errorMessage = 'Este email já está cadastrado';
          }
          addToast({
            type: 'error',
            title: 'Erro no cadastro',
            message: errorMessage,
          });
        } else {
          addToast({
            type: 'success',
            title: 'Cadastro realizado!',
            message: 'Verifique seu email para confirmar o cadastro.',
          });
          setIsRegistering(false);
          setNome('');
        }
      } else {
        console.log('Attempting login with:', email);

        try {
          const { error } = await signIn(email, password);
          console.log('Login result:', { error });

          if (error) {
          if (error.message.includes('Invalid login credentials')) {
            addToast({
              type: 'error',
              title: 'Login falhou',
              message: 'Email ou senha incorretos',
            });
          } else if (error.message.includes('Email not confirmed')) {
            addToast({
              type: 'warning',
              title: 'Email não confirmado',
              message: 'Verifique sua caixa de entrada para confirmar seu email',
            });
          } else {
            addToast({
              type: 'error',
              title: 'Erro no login',
              message: error.message,
            });
          }
        } else {
          addToast({
            type: 'success',
            title: 'Login realizado!',
            message: 'Bem-vindo ao Sistema de Desbravadores',
          });

          router.push('/dashboard');
        }
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      addToast({
        type: 'warning',
        title: 'Atenção',
        message: 'Por favor, informe seu email primeiro',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await import('@/lib/supabase').then(m =>
        m.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/profile?reset=true`,
        })
      );

      if (error) {
        addToast({
          type: 'error',
          title: 'Erro',
          message: error.message,
        });
      } else {
        addToast({
          type: 'success',
          title: 'Email enviado',
          message: 'Verifique sua caixa de entrada para redefinir sua senha',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setErrors({});
    setNome('');
  };

  const roleOptions = [
    { value: 'DESBRAVADOR', label: 'Desbravador' },
    { value: 'LIDER', label: 'Líder' },
    { value: 'DIRIGENTE', label: 'Dirigente' },
    { value: 'ADMIN', label: 'Administrador' },
  ];

  return (
    <div className="min-h-screen w-full max-w-md mx-auto relative flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center gold-glow"
          >
            <svg
              className="w-10 h-10 text-background"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold gold-gradient-text mb-2"
          >
            {isRegistering ? 'Criar Conta' : 'Desbravadores'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm"
            style={{ color: 'var(--text-secondary-color)' }}
          >
            {isRegistering ? 'Preencha os dados para se cadastrar' : 'Sistema de Gestão Premium'}
          </motion.p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {isRegistering && (
            <AppInput
              label="Nome Completo"
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (errors.nome) setErrors({ ...errors, nome: undefined });
              }}
              error={errors.nome}
              leftIcon={<UserPlus className="w-5 h-5" />}
              autoComplete="name"
            />
          )}

          <AppInput
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            leftIcon={<Mail className="w-5 h-5" />}
            autoComplete="email"
          />

          <AppInput
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
            leftIcon={<Lock className="w-5 h-5" />}
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
          />

          {isRegistering && (
            <AppSelect
              label="Tipo de Usuário"
              value={selectedRole}
              onChange={(value) => setSelectedRole(value as UserRole)}
              options={roleOptions}
            />
          )}

          {!isRegistering && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary-light transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          <AppButton
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            rightIcon={isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
          >
            {isRegistering ? 'Cadastrar' : 'Entrar'}
          </AppButton>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-primary hover:text-primary-light transition-colors"
          >
            {isRegistering
              ? 'Já tem uma conta? Entrar'
              : 'Não tem uma conta? Criar conta'}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs mt-8"
          style={{ color: 'var(--text-secondary-color)' }}
        >
          © 2024 Sistema de Desbravadores
        </motion.p>
      </div>
    </div>
  );
}