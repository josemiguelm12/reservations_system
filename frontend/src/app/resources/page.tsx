'use client';

import { useState, useRef } from 'react';
import { useResources } from '@/hooks/use-api';
import { ResourceCard } from '@/components/domain/resource-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState, Pagination } from '@/components/ui/empty-and-pagination';
import {
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
  CurrencyDollarIcon,
  StarIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

const categories = [
  { value: '', label: 'Todos', icon: 'apps' },
  { value: 'ROOM', label: 'Salas', icon: 'meeting_room' },
  { value: 'COURT', label: 'Canchas', icon: 'sports_soccer' },
  { value: 'DESK', label: 'Escritorios', icon: 'desk' },
  { value: 'TABLE', label: 'Mesas', icon: 'table_restaurant' },
  { value: 'EQUIPMENT', label: 'Equipos', icon: 'construction' },
  { value: 'OTHER', label: 'Otros', icon: 'more_horiz' },
];

export default function ResourcesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const limit = 16;

  const { data, isLoading } = useResources({
    page,
    limit,
    search: search || undefined,
    type: type || undefined,
  });

  const scrollCategories = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <header className="space-y-8 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-[var(--on-surface)] tracking-tight">Catálogo de Recursos</h1>
            <p className="text-[var(--on-surface-variant)] font-medium">Descubre espacios premium y equipamiento profesional.</p>
          </div>
          <div className="relative w-full md:w-96">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--outline)]" />
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-4 bg-[var(--surface-container-lowest)] border-none rounded-xl shadow-[var(--shadow-sm)] focus:ring-2 focus:ring-[var(--primary)] text-[var(--on-surface)] placeholder:text-[var(--outline)] transition-all"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 p-2 bg-[var(--surface-container-low)] rounded-2xl">
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-container-lowest)] rounded-lg shadow-[var(--shadow-xs)]">
            <TagIcon className="h-4 w-4 text-[var(--primary)]" />
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-[var(--on-surface)] pr-8 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label === 'Todos' ? 'Todas las Categorías' : cat.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-container-lowest)] rounded-lg shadow-[var(--shadow-xs)]">
            <CurrencyDollarIcon className="h-4 w-4 text-[var(--primary)]" />
            <select className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-[var(--on-surface)] pr-8 cursor-pointer">
              <option>Cualquier Precio</option>
              <option>$0 - $50</option>
              <option>$50 - $150</option>
              <option>$150+</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-container-lowest)] rounded-lg shadow-[var(--shadow-xs)]">
            <StarIcon className="h-4 w-4 text-[var(--primary)]" />
            <select className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-[var(--on-surface)] pr-8 cursor-pointer">
              <option>Mejor Valorados</option>
              <option>Más Recientes</option>
              <option>Precio: Bajo a Alto</option>
            </select>
          </div>
          <div className="ml-auto px-4 text-sm font-bold text-[var(--primary)] flex items-center gap-2 cursor-pointer hover:underline">
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            Más Filtros
          </div>
        </div>
      </header>

      {/* Resource grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={<ArchiveBoxIcon className="h-12 w-12" />}
          title="No se encontraron recursos"
          description="Intenta ajustar tu búsqueda o categoría"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {data?.data.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          {data && (
            <Pagination
              page={page}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
