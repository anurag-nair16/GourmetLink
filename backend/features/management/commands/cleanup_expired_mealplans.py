from django.core.management.base import BaseCommand
from django.utils import timezone
from features.models import MealPlan
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Cleanup expired meal plans and send notifications'

    def handle(self, *args, **options):
        self.stdout.write("Starting cleanup process...")
        
        today = timezone.now().date()
        tomorrow = today + timezone.timedelta(days=1)
        
        try:
            # 1. Handle expired plans
            expired_plans = MealPlan.objects.filter(end_date__lt=today)
            self.stdout.write(f"Found {expired_plans.count()} expired plans")
            
            # Group expired plans by user for notification
            expired_user_plans = {}
            for plan in expired_plans:
                if plan.user.email not in expired_user_plans:
                    expired_user_plans[plan.user.email] = []
                expired_user_plans[plan.user.email].append(plan)
            
            # Send notifications for expired plans
            for user_email, plans in expired_user_plans.items():
                try:
                    plan_names = "\n".join([f"• {plan.name} (ended on {plan.end_date.strftime('%B %d, %Y')})" for plan in plans])
                    
                    # Create HTML content
                    html_content = f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #333;">Your Meal Plans Have Expired</h2>
                        <p>Hello,</p>
                        <p>The following meal plans have expired and will be removed from your account:</p>
                        <ul style="list-style-type: none; padding-left: 0;">
                            {plan_names.replace('•', '<li style="margin-bottom: 10px;">•')}
                        </ul>
                        <p>Don't worry! You can create new meal plans anytime by visiting your <a href="https://gourmetlink.netlify.app/profile" style="color: #007bff; text-decoration: none;">GourmetLink profile</a>.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #666; font-size: 12px;">
                            This is an automated message from GourmetLink. Please do not reply to this email.
                            If you need assistance, please contact us through our <a href="https://gourmetlink.netlify.app/contact" style="color: #007bff; text-decoration: none;">support page</a>.
                        </p>
                    </div>
                    """

                    # Create the email
                    subject = 'Your GourmetLink Meal Plans Have Expired'
                    text_content = f"""Your Meal Plans Have Expired

The following meal plans have expired and will be removed from your account:

{plan_names}

You can create new meal plans anytime by visiting your GourmetLink profile:
https://gourmetlink.netlify.app/profile

Best regards,
The GourmetLink Team"""

                    msg = EmailMultiAlternatives(
                        subject=subject,
                        body=text_content,
                        from_email=f"GourmetLink Team <{settings.DEFAULT_FROM_EMAIL}>",
                        to=[user_email],
                        headers={
                            'List-Unsubscribe': '<https://gourmetlink.netlify.app/unsubscribe>',
                            'X-Entity-Ref-ID': f'gourmetlink-expired-{today.isoformat()}',
                        }
                    )
                    msg.attach_alternative(html_content, "text/html")
                    msg.send()
                    
                    self.stdout.write(f"Sent expired notification to {user_email}")
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to send notification to {user_email}: {str(e)}"))

            # 2. Handle plans expiring tomorrow
            expiring_plans = MealPlan.objects.filter(end_date=tomorrow)
            self.stdout.write(f"Found {expiring_plans.count()} plans expiring tomorrow")
            
            for plan in expiring_plans:
                try:
                    # Create HTML content
                    html_content = f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #333;">Your Meal Plan Is Expiring Soon</h2>
                        <p>Hello,</p>
                        <p>Your meal plan <strong>"{plan.name}"</strong> will expire tomorrow ({tomorrow.strftime('%B %d, %Y')}).</p>
                        <p>Don't worry! You can create a new meal plan anytime by visiting your <a href="https://gourmetlink.netlify.app/profile" style="color: #007bff; text-decoration: none;">GourmetLink profile</a>.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #666; font-size: 12px;">
                            This is an automated message from GourmetLink. Please do not reply to this email.
                            If you need assistance, please contact us through our <a href="https://gourmetlink.netlify.app/contact" style="color: #007bff; text-decoration: none;">support page</a>.
                        </p>
                    </div>
                    """

                    # Create the email
                    subject = 'Your GourmetLink Meal Plan Is Expiring Soon'
                    text_content = f"""Your Meal Plan Is Expiring Soon

Your meal plan "{plan.name}" will expire tomorrow ({tomorrow.strftime('%B %d, %Y')}).

You can create a new meal plan anytime by visiting your GourmetLink profile:
https://gourmetlink.netlify.app/profile

Best regards,
The GourmetLink Team"""

                    msg = EmailMultiAlternatives(
                        subject=subject,
                        body=text_content,
                        from_email=f"GourmetLink Team <{settings.DEFAULT_FROM_EMAIL}>",
                        to=[plan.user.email],
                        headers={
                            'List-Unsubscribe': '<https://gourmetlink.netlify.app/unsubscribe>',
                            'X-Entity-Ref-ID': f'gourmetlink-expiring-{today.isoformat()}',
                        }
                    )
                    msg.attach_alternative(html_content, "text/html")
                    msg.send()
                    
                    self.stdout.write(f"Sent expiring soon notification to {plan.user.email}")
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to send notification to {plan.user.email}: {str(e)}"))

            # 3. Delete expired plans
            deleted_count = expired_plans.delete()
            
            success_message = (
                f'Deleted {deleted_count[0]} expired plans. '
                f'Sent notifications to {len(expired_user_plans)} users about expired plans. '
                f'Sent notifications about {expiring_plans.count()} plans expiring tomorrow.'
            )
            self.stdout.write(self.style.SUCCESS(success_message))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error during cleanup: {str(e)}"))
            raise