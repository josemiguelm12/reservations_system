'use client';

import { useState } from 'react';
import { useResources, useCreateResource, useUpdateResource, useDeleteResource } from '@/hooks/use-api';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/form-fields';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/empty-and-pagination';
import { formatCurrency, getResourceTypeLabel } from '@/lib/utils';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { Resource } from '@/lib/types';

const typeOptions = [
  { value: 'COURT', label: 'Cancha deportiva' },
  { value: 'ROOM', label: 'Sala de reuniones' },
  { value: 'DESK', label: 'Escritorio coworking' },
  { value: 'EQUIPMENT', label: 'Equipo' },
  { value: 'TABLE', label: 'Mesa' },
  { value: 'OTHER', label: 'Otro' },
];

const emptyForm = {
  name: '',
  description: '',
  type: 'ROOM',
  pricePerHour: '',
  capacity: '',
  location: '',
  imageUrl: '',
  amenities: '',
};

export default function AdminResourcesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useResources({ page, limit: 10 });
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (resource: Resource) => {
    setEditing(resource);
    setForm({
      name: resource.name,
      description: resource.description || '',
      type: resource.type,
      pricePerHour: String(resource.pricePerHour),
      capacity: resource.capacity ? String(resource.capacity) : '',
      location: resource.location || '',
      imageUrl: resource.imageUrl || '',
      amenities: resource.amenities ? resource.amenities.join(', ') : '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      name: form.name,
      description: form.description || undefined,
      type: form.type,
      pricePerHour: parseFloat(form.pricePerHour),
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
      location: form.location || undefined,
      imageUrl: form.imageUrl || undefined,
      amenities: form.amenities ? form.amenities.split(',').map((s) => s.trim()) : undefined,
    };

    if (editing) {
      await updateResource.mutateAsync({ id: editing.id, ...body } as any);
    } else {
      await createResource.mutateAsync(body as any);
    }
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteResource.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const setField = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Gestionar Recursos</h1>
          <p className="text-[var(--text-secondary)] mt-1">Administra los recursos del sistema</p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus className="h-4 w-4" />
          Nuevo Recurso
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Nombre
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Tipo
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Precio/h
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Capacidad
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Estado
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-primary)]">
                  {data?.data.map((resource) => (
                    <tr key={resource.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                        {resource.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {getResourceTypeLabel(resource.type)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--brand)] font-medium">
                        {formatCurrency(resource.pricePerHour)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {resource.capacity || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={resource.isActive ? 'success' : 'neutral'}>
                          {resource.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(resource)}
                            className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors cursor-pointer"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(resource.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--danger)] transition-colors cursor-pointer"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          {data && (
            <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Editar Recurso' : 'Nuevo Recurso'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
            <Select label="Tipo" options={typeOptions} value={form.type} onChange={(e) => setField('type', e.target.value)} />
          </div>
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Precio/hora ($)"
              type="number"
              step="0.01"
              value={form.pricePerHour}
              onChange={(e) => setField('pricePerHour', e.target.value)}
              required
            />
            <Input
              label="Capacidad"
              type="number"
              value={form.capacity}
              onChange={(e) => setField('capacity', e.target.value)}
            />
            <Input
              label="Ubicación"
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
            />
          </div>
          <Input
            label="URL de imagen"
            value={form.imageUrl}
            onChange={(e) => setField('imageUrl', e.target.value)}
          />
          <Input
            label="Amenities (separados por coma)"
            value={form.amenities}
            onChange={(e) => setField('amenities', e.target.value)}
            helperText="Ej: WiFi, Proyector, Aire acondicionado"
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={createResource.isPending || updateResource.isPending}
            >
              {editing ? 'Actualizar' : 'Crear'} Recurso
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar Recurso" size="sm">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          ¿Estás seguro de eliminar este recurso? Se eliminarán también sus horarios asociados.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteResource.isPending}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
