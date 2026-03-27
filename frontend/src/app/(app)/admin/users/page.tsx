'use client';

import { useState } from 'react';
import { useUsers, useUpdateUser } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/empty-and-pagination';
import { FiShield, FiUser } from 'react-icons/fi';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUsers(page, 10);
  const updateUser = useUpdateUser();

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'CLIENT' : 'ADMIN';
    await updateUser.mutateAsync({ id: userId, role: newRole });
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    await updateUser.mutateAsync({ id: userId, isActive: !isActive });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Gestionar Usuarios</h1>
        <p className="text-[var(--text-secondary)] mt-1">Administra los usuarios y permisos</p>
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
                      Usuario
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Email
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Rol
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Estado
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Registrado
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-primary)]">
                  {data?.data.map((user) => (
                    <tr key={user.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] flex items-center justify-center text-xs font-medium">
                            {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {user.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'ADMIN' ? 'info' : 'neutral'}>
                          {user.role === 'ADMIN' ? 'Admin' : 'Cliente'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                        {new Date(user.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRole(user.id, user.role)}
                            loading={updateUser.isPending}
                          >
                            {user.role === 'ADMIN' ? (
                              <FiUser className="h-4 w-4" />
                            ) : (
                              <FiShield className="h-4 w-4" />
                            )}
                            {user.role === 'ADMIN' ? 'Hacer Cliente' : 'Hacer Admin'}
                          </Button>
                          <Button
                            variant={user.isActive ? 'danger' : 'primary'}
                            size="sm"
                            onClick={() => toggleActive(user.id, user.isActive)}
                            loading={updateUser.isPending}
                          >
                            {user.isActive ? 'Desactivar' : 'Activar'}
                          </Button>
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
    </div>
  );
}
