import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { emailTemplates } from './templates/email.templates';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private emailService: EmailService) {}

  @OnEvent('reservation.created')
  async handleReservationCreated(payload: any) {
    const { reservation, user, resource } = payload;

    const template = emailTemplates.reservationCreated({
      userName: user.fullName,
      resourceName: resource.name,
      startTime: new Date(reservation.startTime).toLocaleString('en-US', { timeZone: 'UTC' }),
      endTime: new Date(reservation.endTime).toLocaleString('en-US', { timeZone: 'UTC' }),
      totalAmount: reservation.totalAmount,
    });

    await this.emailService.sendEmail(user.email, template.subject, template.html);
    this.logger.log(`Reservation created notification sent to ${user.email}`);
  }

  @OnEvent('reservation.confirmed')
  async handleReservationConfirmed(payload: any) {
    const { reservation } = payload;

    const template = emailTemplates.reservationConfirmed({
      userName: reservation.user.fullName,
      resourceName: reservation.resource.name,
      startTime: new Date(reservation.startTime).toLocaleString('en-US', { timeZone: 'UTC' }),
      endTime: new Date(reservation.endTime).toLocaleString('en-US', { timeZone: 'UTC' }),
    });

    await this.emailService.sendEmail(reservation.user.email, template.subject, template.html);
    this.logger.log(`Reservation confirmed notification sent to ${reservation.user.email}`);
  }

  @OnEvent('reservation.cancelled')
  async handleReservationCancelled(payload: any) {
    const { reservation } = payload;

    const template = emailTemplates.reservationCancelled({
      userName: reservation.user.fullName,
      resourceName: reservation.resource.name,
      startTime: new Date(reservation.startTime).toLocaleString('en-US', { timeZone: 'UTC' }),
    });

    await this.emailService.sendEmail(reservation.user.email, template.subject, template.html);
    this.logger.log(`Reservation cancelled notification sent to ${reservation.user.email}`);
  }

  @OnEvent('payment.completed')
  async handlePaymentCompleted(payload: any) {
    const { payment, reservation } = payload;

    const template = emailTemplates.paymentCompleted({
      userName: reservation.user.fullName,
      amount: payment.amount,
      resourceName: reservation.resource.name,
    });

    await this.emailService.sendEmail(reservation.user.email, template.subject, template.html);
    this.logger.log(`Payment completed notification sent to ${reservation.user.email}`);
  }
}
