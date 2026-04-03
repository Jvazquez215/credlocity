"""
Email notification service for payment events.
Sends alerts for chargebacks, refunds, and large transactions.
"""
import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

SMTP_EMAIL = os.environ.get("SMTP_EMAIL")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
NOTIFICATION_EMAIL = os.environ.get("NOTIFICATION_EMAIL", "admin@credlocity.com")


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send an email via SMTP."""
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured, skipping email")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"Credlocity Payments <{SMTP_EMAIL}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())

        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False


def notify_chargeback(transaction_id: str, amount: float, client_name: str, reason: str, recorded_by: str = ""):
    """Send chargeback notification."""
    subject = f"CHARGEBACK ALERT - ${amount:.2f} - {client_name or 'Unknown'}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Chargeback Alert</h2>
        </div>
        <div style="padding: 24px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666; width: 140px;">Amount:</td>
                    <td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #DC2626;">${amount:.2f}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Client:</td>
                    <td style="padding: 8px 0; font-weight: bold;">{client_name or 'N/A'}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Transaction ID:</td>
                    <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">{transaction_id}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Reason:</td>
                    <td style="padding: 8px 0;">{reason}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Recorded By:</td>
                    <td style="padding: 8px 0;">{recorded_by or 'System'}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Time:</td>
                    <td style="padding: 8px 0;">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</td></tr>
            </table>
            <div style="margin-top: 16px; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid #DC2626;">
                <strong>Action Required:</strong> Review this chargeback in the Payment Management dashboard.
            </div>
        </div>
    </div>"""
    send_email(NOTIFICATION_EMAIL, subject, html)


def notify_refund(transaction_id: str, amount: float, refund_type: str, client_name: str, reason: str, processed_by: str = ""):
    """Send refund notification."""
    subject = f"Refund Processed - ${amount:.2f} ({refund_type}) - {client_name or 'Unknown'}"
    type_label = {"full": "Full Refund", "partial": "Partial Refund", "percentage": "Percentage Refund", "custom": "Custom Refund"}.get(refund_type, refund_type)
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #EA580C; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Refund Notification</h2>
        </div>
        <div style="padding: 24px; background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666; width: 140px;">Refund Amount:</td>
                    <td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #EA580C;">${amount:.2f}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Type:</td>
                    <td style="padding: 8px 0; font-weight: bold;">{type_label}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Client:</td>
                    <td style="padding: 8px 0; font-weight: bold;">{client_name or 'N/A'}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Transaction ID:</td>
                    <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">{transaction_id}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Reason:</td>
                    <td style="padding: 8px 0;">{reason or 'Not specified'}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Processed By:</td>
                    <td style="padding: 8px 0;">{processed_by or 'System'}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Time:</td>
                    <td style="padding: 8px 0;">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</td></tr>
            </table>
        </div>
    </div>"""
    send_email(NOTIFICATION_EMAIL, subject, html)
