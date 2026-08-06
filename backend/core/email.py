import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "") # Note: This needs to be an App Password for Gmail

def send_otp_email(to_email: str, otp_code: str):
    print(f"\n[{'*' * 30}]")
    print(f"MOCK EMAIL DISPATCHER")
    print(f"To: {to_email}")
    print(f"Subject: Your Eloquent One Verification Code")
    print(f"OTP: {otp_code}")
    print(f"[{'*' * 30}]\n")
    
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("SMTP_USERNAME or SMTP_PASSWORD not set. Skipping actual email dispatch.")
        return True
        
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = "Verify your Eloquent One Account"
        
        body = f"""
        Hello!
        
        Thank you for joining Eloquent One.
        Your verification code is: {otp_code}
        
        Please enter this code in the application to complete your registration.
        
        Best,
        The Eloquent One Team
        """
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
