from django.core.management.base import BaseCommand
from django.utils import timezone
from features.models import MealPlan
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Cleanup expired meal plans and send notifications'

    def handle(self, *args, **options):
        self.stdout.write("Starting cleanup process...")
        
        today = timezone.now().date()
        tomorrow = today + timezone.timedelta(days=1)
        
        # Log the current time and environment
        self.stdout.write(f"Current time: {timezone.now()}")
        self.stdout.write(f"Using database: {settings.DATABASES['default']['NAME']}")
        
        try:
            # 1. Handle expired plans
            expired_plans = MealPlan.objects.filter(end_date__lt=today)
            self.stdout.write(f"Found {expired_plans.count()} expired plans")
            
            # Group expired plans by user for notification
            expired_user_plans = {}
            for plan in expired_plans:
                self.stdout.write(f"Processing plan: {plan.name} (ID: {plan.id})")
                if plan.user.email not in expired_user_plans:
                    expired_user_plans[plan.user.email] = []
                expired_user_plans[plan.user.email].append(plan)
            
            # Send notifications for expired plans
            for user_email, plans in expired_user_plans.items():
                try:
                    plan_names = "\n".join([f"- {plan.name} (ended on {plan.end_date})" for plan in plans])
                    send_mail(
                        subject='Your Meal Plans Have Expired',
                        message=f"""The following meal plans have expired and will be deleted:

{plan_names}

You can create new meal plans at any time from your profile.

Best regards,
GourmetLink Team""",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[user_email],
                        fail_silently=False,  # Changed to False for testing
                    )
                    self.stdout.write(f"Sent expired notification to {user_email}")
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to send notification to {user_email}: {str(e)}"))

            # 2. Handle plans expiring tomorrow
            expiring_plans = MealPlan.objects.filter(end_date=tomorrow)
            self.stdout.write(f"Found {expiring_plans.count()} plans expiring tomorrow")
            
            for plan in expiring_plans:
                try:
                    send_mail(
                        subject='Your Meal Plan Is Expiring Soon',
                        message=f"""Your meal plan "{plan.name}" will expire tomorrow ({tomorrow}).

Don't worry! You can always create a new meal plan from your profile.

Best regards,
GourmetLink Team""",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[plan.user.email],
                        fail_silently=False,  # Changed to False for testing
                    )
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