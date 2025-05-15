from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TranslateContent, RecipeDetailView, RecipeTranslationView, MealPlanViewSet, RecipeViewSet, CheatDayAPIView

router = DefaultRouter()
router.register(r'recipes', RecipeViewSet, basename='recipe')
router.register(r'mealplans', MealPlanViewSet, basename='mealplan')

urlpatterns = [
    path('translate/', TranslateContent.as_view(), name='translate'),
    # path('recipess/', RecipeListView.as_view(), name='recipe-list'),
    path('recipes/<int:pk>/', RecipeDetailView.as_view(), name='recipe-detail'),
    path('recipes/<int:pk>/translate/', RecipeTranslationView.as_view(), name='recipe-translate'),
    path('', include(router.urls)),  # Add this for MealPlanViewSet
    path('cheat-day/', CheatDayAPIView.as_view(), name='cheat-day'),
]