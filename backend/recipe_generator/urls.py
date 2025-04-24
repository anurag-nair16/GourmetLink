# recipe_generator/urls.py
from django.urls import path
from .views import AnalyzeIngredientsView, GenerateRecipeView, generate_ai_meal_plan

urlpatterns = [
    path('analyze-ingredients/', AnalyzeIngredientsView.as_view(), name='analyze_ingredients'),
    path('generate-recipe/', GenerateRecipeView.as_view(), name='generate_recipe'),
    path('generate-meal-plan/', generate_ai_meal_plan, name='ai-meal-plan'),
]