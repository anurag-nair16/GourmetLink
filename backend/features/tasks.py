from celery import shared_task
from django.utils import timezone
from .models import MealPlan
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task
def cleanup_expired_mealplans():
    """Task to delete expired meal plans and notify users"""
    today = timezone.now().date()
    
    # Find plans that expired yesterday (to ensure they're fully expired)
    yesterday = today - timezone.timedelta(days=1)
    expired_plans = MealPlan.objects.filter(end_date__lt=today, end_date__gte=yesterday)
    
    # Group plans by user for notification
    user_plans = {}
    for plan in expired_plans:
        if plan.user.email not in user_plans:
            user_plans[plan.user.email] = []
        user_plans[plan.user.email].append(plan)
    
    # Notify users and delete plans
    for user_email, plans in user_plans.items():
        try:
            # Send notification email
            plan_names = "\n".join([f"- {plan.name} (ended on {plan.end_date})" for plan in plans])
            send_mail(
                subject='Your Meal Plans Have Expired',
                message=f"""The following meal plans have expired and will be deleted:

{plan_names}

You can create new meal plans at any time from your profile.

Best regards,
Your Recipe App Team""",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user_email],
                fail_silently=True,
            )
        except Exception as e:
            logger.error(f"Failed to send notification email to {user_email}: {str(e)}")
    
    # Delete all expired plans
    deleted_count = MealPlan.delete_expired()
    
    return f"Deleted {deleted_count[0]} expired meal plans"

@shared_task
def notify_expiring_soon():
    """Task to notify users of meal plans expiring soon"""
    today = timezone.now().date()
    tomorrow = today + timezone.timedelta(days=1)
    
    expiring_plans = MealPlan.objects.filter(end_date=tomorrow)
    
    for plan in expiring_plans:
        try:
            send_mail(
                subject='Your Meal Plan Is Expiring Soon',
                message=f"""Your meal plan "{plan.name}" will expire tomorrow ({tomorrow}).

Don't worry! You can always create a new meal plan from your profile.

Best regards,
Your Recipe App Team""",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[plan.user.email],
                fail_silently=True,
            )
        except Exception as e:
            logger.error(f"Failed to send expiring soon notification to {plan.user.email}: {str(e)}")