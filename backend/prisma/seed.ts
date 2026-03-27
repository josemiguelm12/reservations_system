import { PrismaClient, UserRole, ResourceType, DayOfWeek, ReservationStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.scheduleException.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const userPassword = await bcrypt.hash('User123!', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@reservations.com',
      password: adminPassword,
      fullName: 'System Admin',
      role: UserRole.ADMIN,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: userPassword,
      fullName: 'John Doe',
      role: UserRole.USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: userPassword,
      fullName: 'Jane Smith',
      role: UserRole.CLIENT,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: userPassword,
      fullName: 'Bob Wilson',
      role: UserRole.CLIENT,
    },
  });

  console.log('✅ Users created');

  // ─── Resources ────────────────────────────────────────
  const tennisCourt = await prisma.resource.create({
    data: {
      name: 'Tennis Court A',
      description: 'Professional tennis court with LED lighting and synthetic grass surface. Perfect for singles and doubles matches.',
      type: ResourceType.COURT,
      capacity: 4,
      pricePerHour: 35.00,
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    },
  });

  const tennisCourt2 = await prisma.resource.create({
    data: {
      name: 'Tennis Court B',
      description: 'Indoor tennis court with climate control. Ideal for year-round play.',
      type: ResourceType.COURT,
      capacity: 4,
      pricePerHour: 45.00,
      imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
    },
  });

  const meetingRoom = await prisma.resource.create({
    data: {
      name: 'Executive Meeting Room',
      description: 'Elegant meeting room with 65" screen, video conferencing, whiteboard, and complimentary coffee.',
      type: ResourceType.ROOM,
      capacity: 12,
      pricePerHour: 50.00,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    },
  });

  const coworkingDesk = await prisma.resource.create({
    data: {
      name: 'Hot Desk - Open Space',
      description: 'Flexible desk in our open coworking area. Includes high-speed WiFi, power outlets, and locker.',
      type: ResourceType.DESK,
      capacity: 1,
      pricePerHour: 10.00,
      imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    },
  });

  const privateRoom = await prisma.resource.create({
    data: {
      name: 'Private Office Pod',
      description: 'Soundproof private pod for focused work or confidential calls. Includes monitor and ergonomic chair.',
      type: ResourceType.ROOM,
      capacity: 2,
      pricePerHour: 25.00,
      imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
    },
  });

  const eventHall = await prisma.resource.create({
    data: {
      name: 'Grand Event Hall',
      description: 'Spacious event hall for conferences, workshops, and celebrations. Full AV setup, catering available.',
      type: ResourceType.ROOM,
      capacity: 100,
      pricePerHour: 200.00,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    },
  });

  const basketballCourt = await prisma.resource.create({
    data: {
      name: 'Basketball Court',
      description: 'Full-size indoor basketball court with professional flooring and scoreboards.',
      type: ResourceType.COURT,
      capacity: 20,
      pricePerHour: 80.00,
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    },
  });

  const projector = await prisma.resource.create({
    data: {
      name: 'Portable Projector Kit',
      description: '4K portable projector with screen, speaker, and HDMI/wireless connectivity.',
      type: ResourceType.EQUIPMENT,
      capacity: 1,
      pricePerHour: 15.00,
      imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
    },
  });

  console.log('✅ Resources created');

  // ─── Schedules ────────────────────────────────────────
  const weekdays = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ];
  const weekend = [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY];
  const allDays = [...weekdays, ...weekend];

  const resources = [tennisCourt, tennisCourt2, meetingRoom, coworkingDesk, privateRoom, eventHall, basketballCourt, projector];

  for (const resource of resources) {
    for (const day of weekdays) {
      await prisma.schedule.create({
        data: {
          resourceId: resource.id,
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '22:00',
        },
      });
    }
    for (const day of weekend) {
      await prisma.schedule.create({
        data: {
          resourceId: resource.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '20:00',
        },
      });
    }
  }

  console.log('✅ Schedules created');

  // ─── Schedule Exceptions ──────────────────────────────
  await prisma.scheduleException.create({
    data: {
      resourceId: tennisCourt.id,
      date: new Date('2026-03-15'),
      reason: 'Maintenance day',
    },
  });

  await prisma.scheduleException.create({
    data: {
      resourceId: eventHall.id,
      date: new Date('2026-04-01'),
      reason: 'Private corporate event',
    },
  });

  console.log('✅ Schedule exceptions created');

  // ─── Reservations ─────────────────────────────────────
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(14, 0, 0, 0);

  const r1 = await prisma.reservation.create({
    data: {
      userId: user1.id,
      resourceId: tennisCourt.id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
      status: ReservationStatus.CONFIRMED,
      totalAmount: 70.00,
    },
  });

  const r2 = await prisma.reservation.create({
    data: {
      userId: user2.id,
      resourceId: meetingRoom.id,
      startTime: dayAfter,
      endTime: new Date(dayAfter.getTime() + 3 * 60 * 60 * 1000),
      status: ReservationStatus.PENDING,
      totalAmount: 150.00,
    },
  });

  const r3 = await prisma.reservation.create({
    data: {
      userId: user3.id,
      resourceId: basketballCourt.id,
      startTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000),
      endTime: new Date(tomorrow.getTime() + 6 * 60 * 60 * 1000),
      status: ReservationStatus.CONFIRMED,
      totalAmount: 160.00,
    },
  });

  const r4 = await prisma.reservation.create({
    data: {
      userId: user1.id,
      resourceId: coworkingDesk.id,
      startTime: new Date(dayAfter.getTime() - 4 * 60 * 60 * 1000),
      endTime: new Date(dayAfter.getTime() - 1 * 60 * 60 * 1000),
      status: ReservationStatus.COMPLETED,
      totalAmount: 30.00,
    },
  });

  // Past reservations for stats
  for (let i = 1; i <= 20; i++) {
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - i);
    pastDate.setHours(10 + (i % 8), 0, 0, 0);

    const resource = resources[i % resources.length];
    const user = [user1, user2, user3][i % 3];
    const hours = 1 + (i % 3);
    const status = i % 4 === 0
      ? ReservationStatus.CANCELLED
      : ReservationStatus.COMPLETED;

    await prisma.reservation.create({
      data: {
        userId: user.id,
        resourceId: resource.id,
        startTime: pastDate,
        endTime: new Date(pastDate.getTime() + hours * 60 * 60 * 1000),
        status,
        totalAmount: hours * resource.pricePerHour,
      },
    });
  }

  console.log('✅ Reservations created');

  // ─── Payments ─────────────────────────────────────────
  await prisma.payment.create({
    data: {
      reservationId: r1.id,
      userId: user1.id,
      amount: r1.totalAmount,
      status: PaymentStatus.COMPLETED,
      stripePaymentId: 'pi_demo_1',
    },
  });

  await prisma.payment.create({
    data: {
      reservationId: r3.id,
      userId: user3.id,
      amount: r3.totalAmount,
      status: PaymentStatus.COMPLETED,
      stripePaymentId: 'pi_demo_2',
    },
  });

  await prisma.payment.create({
    data: {
      reservationId: r4.id,
      userId: user1.id,
      amount: r4.totalAmount,
      status: PaymentStatus.COMPLETED,
      stripePaymentId: 'pi_demo_3',
    },
  });

  console.log('✅ Payments created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('  Admin: admin@reservations.com / Admin123!');
  console.log('  User:  john@example.com / User123!');
  console.log('  Client: jane@example.com / User123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
