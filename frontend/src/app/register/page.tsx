'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { registerSchema } from '@/lib/validations';
import { Input, Textarea } from '@/components/ui/form-fields';
import { Button } from '@/components/ui/button';
import {
  UserIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckBadgeIcon,
  BoltIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
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
    <div className="min-h-screen bg-[var(--surface)] pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Branding Header */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-block mb-6">
            <span className="text-xl font-extrabold text-blue-900 tracking-tighter font-[var(--font-headline)]">
              ReservasPro
            </span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[var(--primary)] mb-4">
            Empieza tu experiencia
          </h1>
          <p className="text-[var(--on-surface-variant)] font-medium text-lg">
            {step === 'role' ? 'Selecciona tu perfil para continuar con el registro' : role === 'PARTNER' ? 'Registra tu negocio para ofrecer espacios' : 'Regístrate para reservar espacios'}
          </p>
        </div>

        {step === 'role' ? (
          /* ─── Role Selection (Bento Grid) ─── */
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-3xl mx-auto">
            {/* User Card */}
            <button
              onClick={() => handleSelectRole('CLIENT')}
              className="group relative overflow-hidden bg-[var(--surface-container-lowest)] p-10 rounded-xl transition-all duration-300 hover:bg-[var(--surface-container-high)] border-none outline-none text-left focus:ring-2 focus:ring-[var(--primary)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] cursor-pointer"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[var(--primary-fixed-dim)] rounded-xl flex items-center justify-center mb-6 text-[var(--primary)] group-hover:scale-110 transition-transform duration-300">
                  <UserIcon className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-3">Soy Cliente</h2>
                <p className="text-[var(--on-surface-variant)] leading-relaxed mb-6">
                  Busca y reserva los mejores espacios
                </p>
                <span className="inline-flex items-center text-[var(--primary)] font-bold gap-2">
                  Seleccionar perfil
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-5 text-[var(--primary)]">
                <UserIcon className="h-40 w-40" />
              </div>
            </button>

            {/* Partner Card */}
            <button
              onClick={() => handleSelectRole('PARTNER')}
              className="group relative overflow-hidden bg-[var(--surface-container-lowest)] p-10 rounded-xl transition-all duration-300 hover:bg-[var(--surface-container-high)] border-none outline-none text-left focus:ring-2 focus:ring-[var(--secondary)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] cursor-pointer"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[var(--secondary-container)] rounded-xl flex items-center justify-center mb-6 text-[var(--secondary)] group-hover:scale-110 transition-transform duration-300">
                  <BriefcaseIcon className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-3">Soy Socio</h2>
                <p className="text-[var(--on-surface-variant)] leading-relaxed mb-6">
                  Publica tus recursos y gestiona tus reservas
                </p>
                <span className="inline-flex items-center text-[var(--secondary)] font-bold gap-2">
                  Crear cuenta de empresa
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-5 text-[var(--secondary)]">
                <BriefcaseIcon className="h-40 w-40" />
              </div>
            </button>
          </div>
        ) : (
          /* ─── Registration Form ─── */
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep('role')}
              className="flex items-center gap-1 text-sm text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] mb-4 transition-colors cursor-pointer font-bold"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Cambiar tipo de cuenta
            </button>

            <div className="bg-[var(--surface-container-low)] p-8 md:p-12 rounded-xl">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm">2</span>
                <h3 className="text-xl font-bold">Datos de registro</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {apiError && (
                  <div className="p-3 rounded-lg bg-[var(--error-container)] border border-[var(--error)]/20 text-sm text-[var(--on-error-container)]">
                    {apiError}
                  </div>
                )}

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full name"
                    placeholder="Ej: Juan Pérez"
                    value={form.fullName}
                    onChange={(e) => setField('fullName', e.target.value)}
                    error={errors.fullName}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    error={errors.email}
                  />
                </div>

                {/* Partner Specific */}
                {role === 'PARTNER' && (
                  <div className="pt-6 border-t border-[var(--outline-variant)]/20 space-y-6">
                    <div className="bg-[var(--surface-container)] p-6 rounded-lg space-y-6">
                      <p className="text-sm font-semibold text-[var(--secondary)] flex items-center gap-2">
                        <InformationCircleIcon className="h-5 w-5" />
                        Información de Socio Profesional
                      </p>
                      <Input
                        label="Business Name *"
                        placeholder="Nombre comercial de tu negocio"
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Phone"
                          placeholder="+34 000 000 000"
                          value={form.phone}
                          onChange={(e) => setField('phone', e.target.value)}
                          error={errors.phone}
                        />
                        <Input
                          label="Address"
                          placeholder="Dirección física"
                          value={form.address}
                          onChange={(e) => setField('address', e.target.value)}
                          error={errors.address}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setField('password', e.target.value)}
                    error={errors.password}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => setField('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                  />
                </div>

                {/* Submit */}
                <div className="pt-6">
                  <Button type="submit" loading={loading} fullWidth size="lg">
                    Crear cuenta en ReservasPro
                  </Button>
                  <p className="text-center mt-4 text-sm text-[var(--on-surface-variant)]">
                    ¿Ya tienes cuenta? <Link className="text-[var(--primary)] font-bold hover:underline" href="/login">Inicia sesión</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Value Proposition */}
        <div className="mt-24 grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          <div className="space-y-4">
            <CheckBadgeIcon className="h-8 w-8 text-[var(--tertiary)]" />
            <h4 className="font-bold text-lg">Espacios Curados</h4>
            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">Seleccionamos solo los mejores espacios arquitectónicos para tus necesidades.</p>
          </div>
          <div className="space-y-4">
            <BoltIcon className="h-8 w-8 text-[var(--primary)]" />
            <h4 className="font-bold text-lg">Reserva Inmediata</h4>
            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">Confirmación en tiempo real sin esperas ni llamadas innecesarias.</p>
          </div>
          <div className="space-y-4">
            <ShieldCheckIcon className="h-8 w-8 text-[var(--secondary)]" />
            <h4 className="font-bold text-lg">Garantía Socio</h4>
            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">Protección integral y soporte premium para todos nuestros partners.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
