'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { registerSchema } from '@/lib/validations';
import { Input } from '@/components/ui/form-fields';
import { Button } from '@/components/ui/button';
import type { ZodError } from 'zod';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    try {
      registerSchema.parse(form);
    } catch (err) {
      const zodErr = err as ZodError;
      const fieldErrors: Record<string, string> = {};
      zodErr.issues.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await register(form.email, form.password, form.fullName);
      router.push('/dashboard');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const setField = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--bg-secondary)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-[var(--brand)] flex items-center justify-center text-white font-bold">
              R
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Crear Cuenta</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Regístrate para comenzar a reservar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-primary)] p-6 shadow-sm space-y-4"
        >
          {apiError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              {apiError}
            </div>
          )}

          <Input
            label="Nombre completo"
            placeholder="Juan García"
            value={form.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            error={errors.fullName}
          />

          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            error={errors.email}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            error={errors.password}
          />
          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            value={form.confirmPassword}
            onChange={(e) => setField('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
          />

          <Button type="submit" loading={loading} fullWidth size="lg">
            Crear Cuenta
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[var(--brand)] font-medium hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
