# recipe_generator/urls.py
from django.urls import path
from .views import AnalyzeIngredientsView, GenerateRecipeView

urlpatterns = [
    path('analyze-ingredients/', AnalyzeIngredientsView.as_view(), name='analyze_ingredients'),
    path('generate-recipe/', GenerateRecipeView.as_view(), name='generate_recipe'),
]