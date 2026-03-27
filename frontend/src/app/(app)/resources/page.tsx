'use client';

import { useState, useRef } from 'react';
import { useResources } from '@/hooks/use-api';
import { ResourceCard } from '@/components/domain/resource-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState, Pagination } from '@/components/ui/empty-and-pagination';
import { FiSearch, FiBox, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/* ─── Category filter data ─── */
const categories = [
  { value: '', label: 'All', icon: 'apps' },
  { value: 'ROOM', label: 'Rooms', icon: 'meeting_room' },
  { value: 'COURT', label: 'Courts', icon: 'sports_tennis' },
  { value: 'DESK', label: 'Desks', icon: 'desktop_windows' },
  { value: 'TABLE', label: 'Tables', icon: 'table_restaurant' },
  { value: 'EQUIPMENT', label: 'Equipment', icon: 'build' },
  { value: 'OTHER', label: 'Other', icon: 'category' },
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
      {/* ─── Search bar (Airbnb pill style) ─── */}
      <div className="flex justify-center pt-2">
        <div className="relative w-full max-w-xl">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search rooms, desks, courts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-5 py-3.5 rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] shadow-sm hover:shadow-md transition-all text-sm"
          />
        </div>
      </div>

      {/* ─── Category reel (Airbnb-style) ─── */}
      <div className="relative group/cat">
        {/* Left scroll button */}
        <button
          onClick={() => scrollCategories('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white border border-[var(--border)] shadow-sm flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] opacity-0 group-hover/cat:opacity-100 transition-opacity cursor-pointer"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>

        {/* Categories */}
        <div
          ref={scrollRef}
          className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide px-10 border-b border-[var(--border)] pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => {
            const active = type === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setType(cat.value);
                  setPage(1);
                }}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 min-w-[72px] rounded-xl cursor-pointer transition-all duration-150 ${
                  active
                    ? 'text-[var(--foreground)] border-b-2 border-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-b-2 border-transparent hover:border-[var(--border)]'
                }`}
              >
                <span
                  className="material-icons-outlined"
                  style={{ fontSize: '24px', opacity: active ? 1 : 0.7 }}
                >
                  {cat.icon}
                </span>
                <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scrollCategories('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white border border-[var(--border)] shadow-sm flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] opacity-0 group-hover/cat:opacity-100 transition-opacity cursor-pointer"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ─── Resource grid ─── */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={<FiBox className="h-12 w-12" />}
          title="No resources found"
          description="Try adjusting your search or category filters"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
