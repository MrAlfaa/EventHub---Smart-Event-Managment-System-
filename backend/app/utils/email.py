import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def send_email(recipient_email: str, subject: str, html_content: str) -> bool:
    """
    Send an email using the configured SMTP server
    
    Args:
        recipient_email: The email address to send to
        subject: The email subject
        html_content: The HTML content of the email
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.EMAIL_SENDER
        message["To"] = recipient_email
        
        # Attach HTML content
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Connect to SMTP server and send
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                
            server.sendmail(settings.EMAIL_SENDER, recipient_email, message.as_string())
            
        logger.info(f"Email sent successfully to {recipient_email}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to send email to {recipient_email}: {str(e)}")
        return False

def send_approval_email(email: str, business_name: str, provider_name: str) -> bool:
    """Send an approval notification email to a service provider"""
    subject = "EventHub - Your Service Provider Application is Approved!"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <div style="background-color: #6366F1; color: white; padding: 15px; text-align: center; border-radius: 5px;">
                <h1 style="margin: 0;">Application Approved!</h1>
            </div>
            <div style="padding: 20px 0;">
                <p>Dear <strong>{provider_name}</strong>,</p>
                <p>Congratulations! Your application for <strong>{business_name}</strong> to join EventHub as a service provider has been <span style="color: #22C55E; font-weight: bold;">APPROVED</span>.</p>
                <p>You can now log in to your service provider dashboard and start setting up your packages, gallery, and other details to attract customers.</p>
                <div style="background-color: #F9FAFB; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #6366F1;">What's Next?</h3>
                    <ul style="padding-left: 20px;">
                        <li>Log in to your account</li>
                        <li>Complete your provider profile</li>
                        <li>Add service packages</li>
                        <li>Upload photos to your gallery</li>
                        <li>Set up your availability</li>
                    </ul>
                </div>
                <p>If you have any questions, please contact our support team.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="{settings.FRONTEND_URL}/login" style="background-color: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In Now</a>
                </div>
            </div>
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
                <p>© {settings.APP_NAME}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, subject, html_content)

def send_rejection_email(email: str, business_name: str, provider_name: str, reason: str) -> bool:
    """Send a rejection notification email to a service provider"""
    subject = "EventHub - Your Service Provider Application Status"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <div style="background-color: #6366F1; color: white; padding: 15px; text-align: center; border-radius: 5px;">
                <h1 style="margin: 0;">Application Status Update</h1>
            </div>
            <div style="padding: 20px 0;">
                <p>Dear <strong>{provider_name}</strong>,</p>
                <p>Thank you for your interest in joining EventHub as a service provider. After reviewing your application for <strong>{business_name}</strong>, we regret to inform you that it has not been approved at this time.</p>
                <div style="background-color: #FEF2F2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #EF4444;">Reason for the decision:</h3>
                    <p>{reason}</p>
                </div>
                <p>You may address these concerns and submit a new application in the future. If you believe this decision was made in error or if you have questions, please contact our support team.</p>
            </div>
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
                <p>© {settings.APP_NAME}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, subject, html_content)