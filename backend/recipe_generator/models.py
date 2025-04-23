# recipe_generator/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class IngredientAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    photo = models.ImageField(upload_to='ingredient_photos/')
    ingredients = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

class GeneratedRecipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    analysis = models.ForeignKey(IngredientAnalysis, on_delete=models.CASCADE)
    ingredients = models.JSONField()
    preferences = models.JSONField()
    recipe = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)