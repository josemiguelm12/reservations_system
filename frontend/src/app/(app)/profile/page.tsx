'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUpdateProfile } from '@/hooks/use-api';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/form-fields';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserIcon, EnvelopeIcon, ShieldCheckIcon, BellIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync(form);
  };

  if (!user) return null;

  const initials = user.fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Profile & Settings</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Manage your personal information and preferences</p>
      </div>

      {/* Profile card */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-blue-400 text-white flex items-center justify-center text-xl font-bold shadow-md flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {user.fullName}
              </h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-sm text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <EnvelopeIcon className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                <Badge variant={user.role === 'ADMIN' ? 'info' : 'neutral'}>
                  {user.role === 'ADMIN' ? 'Administrador' : 'Premium Member'}
                </Badge>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-[var(--primary)] bg-[var(--primary-light)] rounded-[var(--radius)] hover:bg-[var(--primary)]/15 transition-colors cursor-pointer">
              Edit Photo
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-[var(--muted-foreground)]" />
            Personal Details
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <Input
                label="Email"
                value={user.email}
                disabled
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={updateProfile.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
            <BellIcon className="h-4 w-4 text-[var(--muted-foreground)]" />
            Notification Preferences
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <ToggleItem
              label="Email Notifications"
              description="Receive booking confirmations and reminders via email"
              checked={notifications.email}
              onChange={(v) => setNotifications({ ...notifications, email: v })}
            />
            <ToggleItem
              label="Push Notifications"
              description="Get instant alerts on your browser"
              checked={notifications.push}
              onChange={(v) => setNotifications({ ...notifications, push: v })}
            />
            <ToggleItem
              label="SMS Notifications"
              description="Receive text message alerts for important updates"
              checked={notifications.sms}
              onChange={(v) => setNotifications({ ...notifications, sms: v })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Payment Methods (visual only) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4 text-[var(--muted-foreground)]" />
              Payment Methods
            </h2>
            <button className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors cursor-pointer">
              + Add New
            </button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="bg-gradient-to-r from-[var(--primary)] to-blue-500 rounded-[var(--radius-lg)] p-5 text-white">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium opacity-80">Credit Card</span>
              <span className="text-sm font-bold">VISA</span>
            </div>
            <p className="text-lg font-mono tracking-widest mb-4">•••• •••• •••• 4242</p>
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-80">{user.fullName}</span>
              <span className="opacity-80">12/28</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Account details */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-[var(--muted-foreground)]" />
            Account Details
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--muted-foreground)] w-32">Role:</span>
            <span className="text-[var(--foreground)] font-medium">
              {user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--muted-foreground)] w-32">Status:</span>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--muted-foreground)] w-32">Member since:</span>
            <span className="text-[var(--foreground)]">
              {new Date(user.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function ToggleItem({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
          checked ? 'bg-[var(--primary)]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
