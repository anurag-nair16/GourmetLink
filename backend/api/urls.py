from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path
from .views import SignupView, LoginView, user_profile, get_user_recipes, RecipeSubmitView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', user_profile, name='user-profile'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('submit-recipe/', RecipeSubmitView.as_view(), name='submit-recipe'),
    path('recipes/', get_user_recipes, name='get_user_recipes'),
]