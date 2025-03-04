from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path
from .views import SignupView, LoginView, user_profile, get_user_recipes, get_nutritional_info, generate_recommendation, UserProfileDetailView, RecipeSubmitView, like_post, add_comment, get_all_posts, UserByEmailView, rate_post, FavouriteRecipesView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from features.views import MealPlanViewSet

router = DefaultRouter()
# Register the MealPlanViewSet with the router
router.register(r'meal-plans', MealPlanViewSet, basename='meal-plan')

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', user_profile, name='user-profile'),
    path('profile/<str:email>/', UserProfileDetailView.as_view(), name='user-profile-detail'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('submit-recipe/', RecipeSubmitView.as_view(), name='submit-recipe'),
    path('recipes/', get_user_recipes, name='get_user_recipes'),
    path('posts/', get_all_posts, name='post_list'),
    path('posts/<int:post_id>/like/', like_post, name='like_post'),
    path('posts/<int:post_id>/comment/', add_comment, name='add_comment'),
    path('posts/<int:post_id>/rate/', rate_post, name='rate_post'),
    path('user-by-email/', UserByEmailView.as_view(), name='user-by-email'),
    path('nutrition/', get_nutritional_info, name='get_nutritional_info'),
    path('recommendation/', generate_recommendation, name='get-recommended-nutrition'),
    path('favourites/', FavouriteRecipesView.as_view(), name='favourite-recipes'),
]