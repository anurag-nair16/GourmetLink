from django.urls import path
from .views import TranslateContent, RecipeDetailView, RecipeListView, RecipeTranslationView, MealPlanViewSet

urlpatterns = [
    path('translate/', TranslateContent.as_view(), name='translate'),
    path('recipes/', RecipeListView.as_view(), name='recipe-list'),
    path('recipes/<int:pk>/', RecipeDetailView.as_view(), name='recipe-detail'),
    path('recipes/<int:pk>/translate/', RecipeTranslationView.as_view(), name='recipe-translate'),
]