'use client';

import { useState } from 'react';
import { useResources, useSchedules, useCreateSchedule, useDeleteSchedule } from '@/hooks/use-api';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/form-fields';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-and-pagination';
import { FiPlus, FiTrash2, FiClock } from 'react-icons/fi';

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function AdminSchedulesPage() {
  const [selectedResource, setSelectedResource] = useState('');
  const { data: resourcesData } = useResources({ limit: 100 });
  const { data: schedulesData, isLoading: schedulesLoading } = useSchedules(
    selectedResource || undefined,
  );
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    resourceId: '',
    dayOfWeek: '1',
    startTime: '08:00',
    endTime: '18:00',
  });

  const resourceOptions = [
    { value: '', label: 'Todos los recursos' },
    ...(resourcesData?.data.map((r) => ({ value: r.id, label: r.name })) || []),
  ];

  const formResourceOptions =
    resourcesData?.data.map((r) => ({ value: r.id, label: r.name })) || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSchedule.mutateAsync({
      resourceId: form.resourceId,
      dayOfWeek: parseInt(form.dayOfWeek),
      startTime: form.startTime,
      endTime: form.endTime,
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteSchedule.mutateAsync(id);
  };

  // Group schedules by day
  const schedules = Array.isArray(schedulesData) ? schedulesData : [];
  const byDay = schedules.reduce(
    (acc: Record<number, any[]>, s: any) => {
      if (!acc[s.dayOfWeek]) acc[s.dayOfWeek] = [];
      acc[s.dayOfWeek].push(s);
      return acc;
    },
    {} as Record<number, any[]>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Gestionar Horarios</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Configura la disponibilidad de los recursos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <FiPlus className="h-4 w-4" />
          Nuevo Horario
        </Button>
      </div>

      {/* Filter by resource */}
      <Select
        options={resourceOptions}
        value={selectedResource}
        onChange={(e) => setSelectedResource(e.target.value)}
        label="Filtrar por recurso"
        className="max-w-xs"
      />

      {/* Schedules */}
      {schedulesLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={<FiClock className="h-12 w-12" />}
          title="No hay horarios configurados"
          description="Crea horarios para que los usuarios puedan reservar"
          action={
            <Button onClick={() => setShowForm(true)}>
              <FiPlus className="h-4 w-4" />
              Crear Horario
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 0]
            .filter((day) => byDay[day]?.length > 0)
            .map((day) => (
              <Card key={day}>
                <CardHeader>
                  <h3 className="font-semibold text-[var(--text-primary)]">{dayNames[day]}</h3>
                </CardHeader>
                <CardBody className="space-y-2">
                  {byDay[day]?.map((schedule: any) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-secondary)]"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {schedule.resource?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--danger)] cursor-pointer"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </CardBody>
              </Card>
            ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nuevo Horario">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Recurso"
            options={formResourceOptions}
            value={form.resourceId}
            onChange={(e) => setForm({ ...form, resourceId: e.target.value })}
            placeholder="Selecciona un recurso"
          />
          <Select
            label="Día de la semana"
            options={dayNames.map((name, i) => ({ value: String(i), label: name }))}
            value={form.dayOfWeek}
            onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hora inicio"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <Input
              label="Hora fin"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={createSchedule.isPending}>
              Crear Horario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
