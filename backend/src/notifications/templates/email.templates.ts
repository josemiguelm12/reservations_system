export const emailTemplates = {
  reservationCreated: (data: {
    userName: string;
    resourceName: string;
    startTime: string;
    endTime: string;
    totalAmount: number;
  }) => ({
    subject: `Reservation Created - ${data.resourceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f7fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .detail { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { color: #6b7280; font-weight: 500; }
          .detail-value { color: #111827; font-weight: 600; }
          .amount { font-size: 28px; color: #3b82f6; text-align: center; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Reservation Created</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${data.userName}</strong>,</p>
            <p>Your reservation has been created successfully!</p>
            <div class="detail">
              <span class="detail-label">Resource</span>
              <span class="detail-value">${data.resourceName}</span>
            </div>
            <div class="detail">
              <span class="detail-label">Start</span>
              <span class="detail-value">${data.startTime}</span>
            </div>
            <div class="detail">
              <span class="detail-label">End</span>
              <span class="detail-value">${data.endTime}</span>
            </div>
            <div class="amount">$${data.totalAmount.toFixed(2)}</div>
            <p>Please complete the payment to confirm your reservation.</p>
          </div>
          <div class="footer">
            <p>Reservations Platform &copy; 2026</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  reservationConfirmed: (data: {
    userName: string;
    resourceName: string;
    startTime: string;
    endTime: string;
  }) => ({
    subject: `Reservation Confirmed - ${data.resourceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f7fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .detail { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { color: #6b7280; font-weight: 500; }
          .detail-value { color: #111827; font-weight: 600; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Reservation Confirmed</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${data.userName}</strong>,</p>
            <p>Your reservation has been confirmed!</p>
            <div class="detail">
              <span class="detail-label">Resource</span>
              <span class="detail-value">${data.resourceName}</span>
            </div>
            <div class="detail">
              <span class="detail-label">Start</span>
              <span class="detail-value">${data.startTime}</span>
            </div>
            <div class="detail">
              <span class="detail-label">End</span>
              <span class="detail-value">${data.endTime}</span>
            </div>
            <p>See you there!</p>
          </div>
          <div class="footer">
            <p>Reservations Platform &copy; 2026</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  reservationCancelled: (data: {
    userName: string;
    resourceName: string;
    startTime: string;
  }) => ({
    subject: `Reservation Cancelled - ${data.resourceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f7fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Reservation Cancelled</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${data.userName}</strong>,</p>
            <p>Your reservation for <strong>${data.resourceName}</strong> scheduled for <strong>${data.startTime}</strong> has been cancelled.</p>
            <p>If you didn't request this cancellation, please contact support.</p>
          </div>
          <div class="footer">
            <p>Reservations Platform &copy; 2026</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  paymentCompleted: (data: {
    userName: string;
    amount: number;
    resourceName: string;
  }) => ({
    subject: `Payment Received - $${data.amount.toFixed(2)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f7fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 30px; text-align: center; }
          .amount { font-size: 36px; color: #10b981; margin: 20px 0; font-weight: 700; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Payment Received</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${data.userName}</strong>,</p>
            <p>We've received your payment for <strong>${data.resourceName}</strong>:</p>
            <div class="amount">$${data.amount.toFixed(2)}</div>
            <p>Your reservation is now confirmed. Thank you!</p>
          </div>
          <div class="footer">
            <p>Reservations Platform &copy; 2026</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};
