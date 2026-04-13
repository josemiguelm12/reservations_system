'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useResources } from '@/hooks/use-api';
import { useAuth } from '@/contexts/auth-context';
import { ResourceCard } from '@/components/domain/resource-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PublicNavbar } from '@/components/layout/public-navbar';
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  MapPinIcon,
  CalendarDaysIcon,
  TagIcon,
  PaperAirplaneIcon,
  GlobeAltIcon,
  ShareIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  TrophyIcon,
  ComputerDesktopIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';

const categories = [
  { value: 'ROOM', label: 'Salas', icon: BuildingOfficeIcon, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
  { value: 'COURT', label: 'Canchas', icon: TrophyIcon, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
  { value: 'DESK', label: 'Escritorios', icon: ComputerDesktopIcon, gradient: 'from-orange-500 to-yellow-600', shadow: 'shadow-orange-500/20' },
  { value: 'TABLE', label: 'Mesas', icon: CubeIcon, gradient: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/20' },
  { value: 'EQUIPMENT', label: 'Equipos', icon: WrenchScrewdriverIcon, gradient: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/20' },
  { value: 'OTHER', label: 'Otros', icon: EllipsisHorizontalIcon, gradient: 'from-slate-500 to-slate-700', shadow: 'shadow-slate-500/20' },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: featuredData, isLoading } = useResources({ limit: 8 });

  useEffect(() => {
    if (!authLoading && user && (user.role === 'ADMIN' || user.role === 'PARTNER')) {
      router.replace('/dashboard');
    }
  }, [authLoading, user, router]);

  if (authLoading || (user && (user.role === 'ADMIN' || user.role === 'PARTNER'))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/resources?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/resources');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] font-[family-name:var(--font-manrope)]">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[540px] flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-16 pb-8">
        {/* Gradient Blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--primary)]/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[var(--secondary)]/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-4xl space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[var(--on-surface)]">
            Encuentra el espacio perfecto para tu{' '}
            <span className="text-[var(--primary)]">próximo éxito</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--on-surface-variant)] max-w-2xl mx-auto leading-relaxed">
            Acceso premium a salas de juntas, canchas deportivas, escritorios compartidos y equipamiento profesional con un solo clic.
          </p>

          {/* Search Pill */}
          <form onSubmit={handleSearch} className="mt-8">
            <div className="bg-[var(--surface-container-lowest)] rounded-full p-2 shadow-xl shadow-[var(--on-surface)]/5 border border-[var(--surface-container)] flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto">
              <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-[var(--surface-container)]">
                <MapPinIcon className="h-5 w-5 text-[var(--primary)]" />
                <div className="text-left flex-1">
                  <label className="block text-[10px] uppercase font-bold text-[var(--outline)] tracking-wider">Ubicación</label>
                  <input
                    className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 focus:outline-none placeholder:text-[var(--outline)]/60 text-[var(--on-surface)]"
                    placeholder="¿A dónde vas?"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-[var(--surface-container)]">
                <CalendarDaysIcon className="h-5 w-5 text-[var(--primary)]" />
                <div className="text-left flex-1">
                  <label className="block text-[10px] uppercase font-bold text-[var(--outline)] tracking-wider">Fecha</label>
                  <input className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 focus:outline-none text-[var(--on-surface)]" type="date" />
                </div>
              </div>
              <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full">
                <TagIcon className="h-5 w-5 text-[var(--primary)]" />
                <div className="text-left flex-1">
                  <label className="block text-[10px] uppercase font-bold text-[var(--outline)] tracking-wider">Tipo</label>
                  <select className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 focus:outline-none appearance-none text-[var(--on-surface)]">
                    <option>Todos los espacios</option>
                    <option>Salas</option>
                    <option>Canchas</option>
                    <option>Escritorios</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 bg-[var(--primary)] text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[var(--primary)]/25 cursor-pointer"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-[var(--on-surface)]">Explora por Categoría</h2>
          <p className="text-[var(--on-surface-variant)]">Arquitectura de espacios diseñada para cada necesidad profesional y recreativa.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              href={`/resources?type=${cat.value}`}
              className="group flex flex-col items-center p-8 rounded-xl bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)] transition-all duration-300"
            >
              <cat.icon className="h-10 w-10 text-[var(--primary)] mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm tracking-tight text-[var(--on-surface)]">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-12 bg-[var(--surface-container-low)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-[var(--on-surface)]">Recursos Destacados</h2>
              <p className="text-[var(--on-surface-variant)]">Seleccionados por su calidad, ubicación y servicios incluidos.</p>
            </div>
            <Link href="/resources" className="text-[var(--primary)] font-bold hover:underline flex items-center gap-2">
              Ver todos <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : featuredData?.data && featuredData.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredData.data.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[var(--on-surface-variant)]">
              <p>Aún no hay recursos disponibles.</p>
            </div>
          )}
        </div>
      </section>

      {/* Partner CTA Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto bg-[var(--primary)] rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)]"></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[var(--secondary)] opacity-20 blur-3xl"></div>
          <div className="relative z-10 p-12 md:p-20 md:w-2/3 space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              ¿Tienes espacios disponibles?{' '}
              <span className="text-[var(--secondary-container)]">Únete como socio</span> y empieza a ganar
            </h2>
            <p className="text-[var(--primary-fixed)] text-lg max-w-xl">
              Maximiza la rentabilidad de tus activos arquitectónicos. Conéctate con miles de profesionales y empresas que buscan precisamente lo que tú ofreces.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-[var(--secondary)] text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-black/10"
              >
                Unirse como Socio
              </Link>
              <button className="px-8 py-4 bg-white/10 text-white backdrop-blur-md rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20">
                Saber más
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 w-full relative bottom-0 border-t border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-12 py-10 w-full">
          <div className="space-y-6">
            <div className="text-blue-400 font-bold text-xl">ReservasPro</div>
            <p className="text-slate-500 text-xs uppercase tracking-widest leading-relaxed">
              © {new Date().getFullYear()} ReservasPro. Tonal Architecture Systems. <br />
              Precision Curator of High-End Marketplace Assets.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm tracking-tight">Recursos</h4>
              <ul className="space-y-2">
                <li><Link className="text-slate-500 text-xs uppercase tracking-widest hover:text-emerald-400 transition-colors" href="/resources?type=ROOM">Salas</Link></li>
                <li><Link className="text-slate-500 text-xs uppercase tracking-widest hover:text-emerald-400 transition-colors" href="/resources?type=COURT">Canchas</Link></li>
                <li><Link className="text-slate-500 text-xs uppercase tracking-widest hover:text-emerald-400 transition-colors" href="/resources?type=DESK">Escritorios</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm tracking-tight">Compañía</h4>
              <ul className="space-y-2">
                <li><Link className="text-slate-500 text-xs uppercase tracking-widest hover:text-emerald-400 transition-colors" href="/resources?type=TABLE">Mesas</Link></li>
                <li><Link className="text-slate-500 text-xs uppercase tracking-widest hover:text-emerald-400 transition-colors" href="/resources?type=EQUIPMENT">Equipos</Link></li>
                <li><Link className="text-slate-500 text-xs uppercase tracking-widest hover:text-emerald-400 transition-colors" href="/register">Partner Program</Link></li>
              </ul>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-white font-bold text-sm tracking-tight">Suscríbete</h4>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-900 border-none rounded-lg text-white px-4 py-2 text-sm focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
                placeholder="email@dominio.com"
                type="email"
              />
              <button className="bg-emerald-500 p-2 rounded-lg text-black hover:bg-emerald-400 transition-colors">
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-4">
              <a className="text-slate-500 hover:text-white transition-colors" href="#"><GlobeAltIcon className="h-5 w-5" /></a>
              <a className="text-slate-500 hover:text-white transition-colors" href="#"><ShareIcon className="h-5 w-5" /></a>
              <a className="text-slate-500 hover:text-white transition-colors" href="#"><EnvelopeIcon className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
