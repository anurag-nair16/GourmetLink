from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import MealPlan
import logging

logger = logging.getLogger(__name__)

@receiver(pre_delete, sender=MealPlan)
def log_meal_plan_deletion(sender, instance, **kwargs):
    """Log when a meal plan is deleted"""
    logger.info(
        f"Deleting meal plan: {instance.name} (ID: {instance.id}) - "
        f"User: {instance.user.username} - End date: {instance.end_date}"
    )