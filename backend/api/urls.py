from django.urls import path, re_path, include
from django.views.generic import TemplateView
from .views import home  # Import your home view
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('recipe', RecipeViewSet, basename='recipe')

urlpatterns = [
    path('', home, name='home'),  # Serve the home page (if you want a separate view)
    path('', include(router.urls)),  # Serve API routes
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    re_path(r'^(?:.*)/?$', TemplateView.as_view(template_name="index.html")),  # Serve React app
]
