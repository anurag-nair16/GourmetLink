from django.db import models
from django.conf import settings
from api.models import Recipe

class MealPlan(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  
        on_delete=models.CASCADE,
        related_name='meal_plans'  # changed to a more meaningful related name
    )
    name = models.CharField(max_length=100, default="My Meal Plan")
    start_date = models.DateField()
    end_date = models.DateField()  # Add end_date to manually define the duration of the meal plan
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    # Optional method to calculate duration in days (if needed)
    @property
    def duration_days(self):
        return (self.end_date - self.start_date).days

class MealPlanEntry(models.Model):
    MEAL_TYPES = [
        ("breakfast", "Breakfast"),
        ("lunch", "Lunch"),
        ("dinner", "Dinner"),
        ("snack", "Snack"),
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
