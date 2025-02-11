from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path
from .views import SignupView, LoginView, user_profile, get_user_recipes, RecipeSubmitView, like_post, add_comment, get_all_posts, UserByEmailView, rate_post
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', user_profile, name='user-profile'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('submit-recipe/', RecipeSubmitView.as_view(), name='submit-recipe'),
    path('recipes/', get_user_recipes, name='get_user_recipes'),
    path('posts/', get_all_posts, name='post_list'),
    path('posts/<int:post_id>/like/', like_post, name='like_post'),
    path('posts/<int:post_id>/comment/', add_comment, name='add_comment'),
    path('posts/<int:post_id>/rate/', rate_post, name='rate_post'),
    path('user-by-email/', UserByEmailView.as_view(), name='user-by-email'),
]