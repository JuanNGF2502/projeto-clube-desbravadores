'use client';

import { useState } from 'react';
import { User, Mail, Lock, Shield, Check, Loader2, AlertCircle } from 'lucide-react';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase/client';

interface CriarAcessoModalProps {
  isOpen: boolean;
  onClose: () => void;
  membroNome: string;
  membroId: string;
  onSuccess?: () => void;
}

export function CriarAcessoModal({
  isOpen,
  onClose,
  membroNome,
  membroId,
  onSuccess,
}: CriarAcessoModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('DESBRAVADOR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async () => {
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    if (!membroId) {
      setError('Membro não identificado');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Sessão expirada');

      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          memberId: membroId,
          email,
          password,
          nome: membroNome,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      setSuccess(true);
      addToast({
        type: 'success',
        title: 'Acesso criado!',
        message: `Usuário ${email} criado para ${membroNome}`,
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
      addToast({
        type: 'error',
        title: 'Erro',
        message: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('DESBRAVADOR');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Criar Acesso ao Sistema"
      size="sm"
    >
      <div className="space-y-4">
        {success ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-success" />
            </div>
            <p className="font-semibold text-text-primary">Usuário criado com sucesso!</p>
            <p className="text-sm text-muted">{email}</p>
            <AppButton variant="primary" onClick={handleClose} className="mt-2">
              Fechar
            </AppButton>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">{membroNome}</p>
                <p className="text-xs text-muted">ID: {membroId.slice(0, 8)}...</p>
              </div>
            </div>

            <AppInput
              label="Email de acesso"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <AppInput
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <AppInput
              label="Confirmar senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <AppSelect
              label="Nível de acesso"
              value={role}
              onChange={(value) => setRole(value)}
              options={[
                { value: 'DESBRAVADOR', label: 'Desbravador' },
                { value: 'LIDER', label: 'Líder' },
                { value: 'ADMIN', label: 'Administrador' },
              ]}
            />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 text-danger text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <AppButton variant="secondary" onClick={handleClose} className="flex-1" disabled={isLoading}>
                Cancelar
              </AppButton>
              <AppButton variant="primary" onClick={handleSubmit} className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Criando...' : 'Criar Acesso'}
              </AppButton>
            </div>
          </>
        )}
      </div>
    </AppModal>
  );
}
