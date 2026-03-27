import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentStatus, ReservationStatus } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentIntentDto } from './dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(stripeKey || 'sk_test_placeholder', {
      apiVersion: '2024-12-18.acacia' as any,
    });
  }

  /**
   * Create a Stripe Payment Intent for a reservation.
   */
  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
      include: { payment: true, resource: true },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.userId !== userId) {
      throw new BadRequestException('You can only pay for your own reservations');
    }
    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay for cancelled reservation');
    }
    if (reservation.payment?.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Reservation already paid');
    }

    // Create Stripe Payment Intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(reservation.totalAmount * 100), // cents
      currency: 'usd',
      metadata: {
        reservationId: reservation.id,
        userId,
        resourceName: reservation.resource.name,
      },
    });

    // Create or update payment record
    const payment = await this.prisma.payment.upsert({
      where: { reservationId: reservation.id },
      create: {
        reservationId: reservation.id,
        userId,
        amount: reservation.totalAmount,
        status: PaymentStatus.PENDING,
        stripePaymentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret,
      },
      update: {
        stripePaymentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret,
        status: PaymentStatus.PENDING,
      },
    });

    this.logger.log(`Payment intent created: ${paymentIntent.id} for reservation ${reservation.id}`);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount: reservation.totalAmount,
    };
  }

  /**
   * Handle Stripe webhook events.
   * Only trust server-side webhook for payment confirmation.
   */
  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret || '',
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Webhook signature verification failed');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const reservationId = paymentIntent.metadata.reservationId;

    // Use transaction for atomicity
    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { stripePaymentId: paymentIntent.id },
        data: { status: PaymentStatus.COMPLETED },
      });

      const reservation = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CONFIRMED },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          resource: { select: { id: true, name: true } },
        },
      });

      this.logger.log(`Payment completed for reservation ${reservationId}`);

      this.eventEmitter.emit('payment.completed', {
        payment,
        reservation,
      });
    });
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.update({
      where: { stripePaymentId: paymentIntent.id },
      data: { status: PaymentStatus.FAILED },
    });

    this.logger.warn(`Payment failed for intent ${paymentIntent.id}`);

    this.eventEmitter.emit('payment.failed', {
      paymentIntentId: paymentIntent.id,
    });
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          reservation: {
            include: {
              resource: { select: { id: true, name: true, type: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);

    return {
      data: payments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        include: {
          reservation: {
            include: {
              resource: { select: { id: true, name: true, type: true } },
            },
          },
          user: { select: { id: true, email: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count(),
    ]);

    return {
      data: payments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
