from django.db import models
from django.conf import settings
from api.models import Recipe
from django.utils import timezone

class MealPlan(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  
        on_delete=models.CASCADE,
        related_name='meal_plans'
    )
    name = models.CharField(max_length=100, default="My Meal Plan")
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['end_date']),  # Add index for better query performance
        ]

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    @property
    def duration_days(self):
        return (self.end_date - self.start_date).days

    @property
    def is_expired(self):
        return self.end_date < timezone.now().date()

    @classmethod
    def delete_expired(cls):
        """Delete all expired meal plans"""
        return cls.objects.filter(end_date__lt=timezone.now().date()).delete()

class MealPlanEntry(models.Model):
    MEAL_TYPES = [
        ("breakfast", "Breakfast"),
        ("lunch", "Lunch"),
        ("dinner", "Dinner"),
    ]
    
    meal_plan = models.ForeignKey(MealPlan, on_delete=models.CASCADE, related_name="entries")
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)  # Assuming Recipe model exists
    day = models.PositiveIntegerField()  # Day 1-N for the custom date range (start_date to end_date)
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES)
    servings = models.PositiveIntegerField(default=1)  # Number of servings

    class Meta:
        unique_together = ('meal_plan', 'day', 'meal_type')  # Prevent duplicate entries per day/meal

    def __str__(self):
        return f"{self.meal_type} - Day {self.day} - {self.recipe.name}"
