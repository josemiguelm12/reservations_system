'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { registerSchema } from '@/lib/validations';
import { Input, Textarea } from '@/components/ui/form-fields';
import { Button } from '@/components/ui/button';
import { FiUser, FiBriefcase, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import type { ZodError } from 'zod';

type Role = 'CLIENT' | 'PARTNER';

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<Role>('CLIENT');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessDescription: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSelectRole = (r: Role) => {
    setRole(r);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    const payload = { ...form, role };

    try {
      registerSchema.parse(payload);
    } catch (err) {
      const zodErr = err as ZodError;
      const fieldErrors: Record<string, string> = {};
      zodErr.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role,
        ...(role === 'PARTNER' && {
          businessName: form.businessName,
          businessDescription: form.businessDescription || undefined,
          phone: form.phone || undefined,
          address: form.address || undefined,
        }),
      });
      const from = searchParams.get('from');
      router.push(from || (role === 'PARTNER' ? '/dashboard' : '/resources'));
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const setField = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--background)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-blue-500 flex items-center justify-center shadow-sm">
              <span className="material-icons-outlined text-white" style={{ fontSize: '22px' }}>
                event_available
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Crear Cuenta</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {step === 'role'
              ? '¿Cómo quieres usar ReservasPro?'
              : role === 'PARTNER'
                ? 'Registra tu negocio para ofrecer espacios'
                : 'Regístrate para reservar espacios'}
          </p>
        </div>

        {step === 'role' ? (
          /* ─── Role Selection ─── */
          <div className="space-y-4">
            <button
              onClick={() => handleSelectRole('CLIENT')}
              className="w-full group p-6 bg-white rounded-2xl border-2 border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200 text-left cursor-pointer hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                  <FiUser className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--foreground)] text-lg mb-1">Soy Cliente</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    Quiero buscar y reservar espacios, canchas, salas y más.
                  </p>
                </div>
                <FiArrowRight className="h-5 w-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] mt-1 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            <button
              onClick={() => handleSelectRole('PARTNER')}
              className="w-full group p-6 bg-white rounded-2xl border-2 border-[var(--border)] hover:border-emerald-500 transition-all duration-200 text-left cursor-pointer hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <FiBriefcase className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--foreground)] text-lg mb-1">Soy Socio</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    Tengo espacios o servicios que quiero publicar y recibir reservas.
                  </p>
                </div>
                <FiArrowRight className="h-5 w-5 text-[var(--muted-foreground)] group-hover:text-emerald-500 mt-1 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        ) : (
          /* ─── Registration Form ─── */
          <>
            <button
              onClick={() => setStep('role')}
              className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 transition-colors cursor-pointer"
            >
              <FiArrowLeft className="h-4 w-4" />
              Cambiar tipo de cuenta
            </button>

            {/* Role indicator */}
            <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${
              role === 'PARTNER'
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white ${
                role === 'PARTNER' ? 'bg-emerald-500' : 'bg-[var(--primary)]'
              }`}>
                {role === 'PARTNER' ? <FiBriefcase className="h-4 w-4" /> : <FiUser className="h-4 w-4" />}
              </div>
              <span className={`text-sm font-semibold ${
                role === 'PARTNER' ? 'text-emerald-700' : 'text-blue-700'
              }`}>
                {role === 'PARTNER' ? 'Registro como Socio' : 'Registro como Cliente'}
              </span>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4"
            >
              {apiError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
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

              {/* Partner-only fields */}
              {role === 'PARTNER' && (
                <div className="space-y-4 pt-2 border-t border-[var(--border)]">
                  <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                    Datos del negocio
                  </p>

                  <Input
                    label="Nombre del negocio *"
                    placeholder="Mi Empresa S.R.L."
                    value={form.businessName}
                    onChange={(e) => setField('businessName', e.target.value)}
                    error={errors.businessName}
                  />

                  <Textarea
                    label="Descripción del negocio"
                    placeholder="Cuéntanos sobre tu negocio..."
                    value={form.businessDescription}
                    onChange={(e) => setField('businessDescription', e.target.value)}
                    error={errors.businessDescription}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Teléfono"
                      placeholder="+1 809-555-0123"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      error={errors.phone}
                    />
                    <Input
                      label="Dirección"
                      placeholder="Calle Principal #10"
                      value={form.address}
                      onChange={(e) => setField('address', e.target.value)}
                      error={errors.address}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" loading={loading} fullWidth size="lg">
                {role === 'PARTNER' ? 'Registrar mi Negocio' : 'Crear Cuenta'}
              </Button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
