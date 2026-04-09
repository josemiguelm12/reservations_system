'use client';

import { useDashboardStats, useRevenueByPeriod, useTopResources, useReservationTrends } from '@/hooks/use-api';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RevenueChart, TopResourcesChart, TrendChart } from '@/components/domain/charts';
import { formatCurrency } from '@/lib/utils';
import { CalendarDaysIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function AdminStatsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenue, isLoading: revLoading } = useRevenueByPeriod('month', 6);
  const { data: topResources, isLoading: topLoading } = useTopResources(5);
  const { data: trends, isLoading: trendsLoading } = useReservationTrends(30);

  if (statsLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Estadísticas</h1>
        <p className="text-[var(--text-secondary)] mt-1">Métricas y análisis del sistema</p>
      </div>

      {/* Summary cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={<CalendarDaysIcon className="h-5 w-5" />}
            label="Total Reservas"
            value={String(stats.totalReservations)}
            color="text-blue-600"
            bg="bg-blue-50 dark:bg-blue-900/20"
          />
          <SummaryCard
            icon={<CurrencyDollarIcon className="h-5 w-5" />}
            label="Ingresos Totales"
            value={formatCurrency(stats.totalRevenue)}
            color="text-emerald-600"
            bg="bg-emerald-50 dark:bg-emerald-900/20"
          />
          <SummaryCard
            icon={<ArrowTrendingUpIcon className="h-5 w-5" />}
            label="Ingresos Mensual"
            value={formatCurrency(stats.monthlyRevenue)}
            color="text-violet-600"
            bg="bg-violet-50 dark:bg-violet-900/20"
          />
          <SummaryCard
            icon={<UserGroupIcon className="h-5 w-5" />}
            label="Total Usuarios"
            value={String(stats.totalUsers)}
            color="text-amber-600"
            bg="bg-amber-50 dark:bg-amber-900/20"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[var(--text-primary)]">Ingresos por Mes</h2>
          </CardHeader>
          <CardBody>
            {revLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : revenue && revenue.length > 0 ? (
              <RevenueChart data={revenue} />
            ) : (
              <p className="text-center py-8 text-sm text-[var(--text-muted)]">Sin datos</p>
            )}
          </CardBody>
        </Card>

        {/* Top resources chart */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[var(--text-primary)]">Recursos Más Reservados</h2>
          </CardHeader>
          <CardBody>
            {topLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : topResources && topResources.length > 0 ? (
              <TopResourcesChart data={topResources} />
            ) : (
              <p className="text-center py-8 text-sm text-[var(--text-muted)]">Sin datos</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Trends */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--text-primary)]">Tendencia de Reservas (30 días)</h2>
        </CardHeader>
        <CardBody>
          {trendsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : trends && trends.length > 0 ? (
            <TrendChart data={trends} />
          ) : (
            <p className="text-center py-8 text-sm text-[var(--text-muted)]">Sin datos</p>
          )}
        </CardBody>
      </Card>

      {/* Top resources table */}
      {topResources && topResources.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[var(--text-primary)]">Top Recursos por Ingresos</h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                  <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                    #
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                    Recurso
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                    Reservas
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {topResources.map((item, i) => (
                  <tr key={item.resourceName} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-6 py-3 text-sm text-[var(--text-muted)]">{i + 1}</td>
                    <td className="px-6 py-3 text-sm font-medium text-[var(--text-primary)]">
                      {item.resourceName}
                    </td>
                    <td className="px-6 py-3 text-sm text-[var(--text-secondary)]">
                      {item.totalReservations}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-[var(--brand)]">
                      {formatCurrency(item.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-lg ${bg} ${color} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{label}</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
