/**
 * Email service for sending notifications
 */

import sgMail from '@sendgrid/mail';

export class EmailService {
  private readonly myEmail: string;
  private readonly sendGridApiKey: string;

  constructor(myEmail: string, sendGridApiKey: string) {
    this.myEmail = myEmail;
    this.sendGridApiKey = sendGridApiKey;
    sgMail.setApiKey(this.sendGridApiKey);
  }

  /**
   * Send an email to the developer
   */
  async sendEmailToDeveloper(message: string): Promise<void> {
    const msg = {
      to: this.myEmail,
      from: `Sunnah Assistant Backend <${this.myEmail}>`,
      subject: 'Sunnah Assistant Api Failure',
      text: message,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}