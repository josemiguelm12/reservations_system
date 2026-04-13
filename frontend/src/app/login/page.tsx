'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { loginSchema } from '@/lib/validations';
import { Input } from '@/components/ui/form-fields';
import { Button } from '@/components/ui/button';
import type { ZodError } from 'zod';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    try {
      loginSchema.parse(form);
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
      const loggedUser = await login(form.email, form.password);
      // Partners & Admins manage spaces → dashboard; Clients browse → catalog
      const dest = loggedUser?.role === 'CLIENT' ? '/resources' : '/dashboard';
      router.push(dest);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-secondary)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-[var(--brand)] flex items-center justify-center text-white font-bold">
              R
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Iniciar Sesión</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Ingresa tus credenciales para acceder
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
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />

          <Button type="submit" loading={loading} fullWidth size="lg">
            Iniciar Sesión
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-[var(--brand)] font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
