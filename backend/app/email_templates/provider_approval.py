def get_approval_template(provider_name, business_name, login_url):
    return f"""
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
                    <a href="{login_url}" style="background-color: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In Now</a>
                </div>
            </div>
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
                <p>© EventHub. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_rejection_template(provider_name, business_name, reason):
    return f"""
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
                <p>© EventHub. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """