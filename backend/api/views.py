from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.contrib.auth.models import User
import requests, json, os, logging
from django.views.decorators.csrf import csrf_exempt
from .models import Post, Rating, Comment, CustomUser, Recipe
from .serializers import PostSerializer, RatingSerializer, CommentSerializer, UserSerializer, RecipeSerializer, CustomUserSerializer
from rest_framework import status
import google.generativeai as genai
from django.db.models import Count, Avg, FloatField, Prefetch # <-- Import FloatField
from django.db.models.functions import Coalesce 

class UserProfileDetailView(generics.RetrieveAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        email = self.kwargs.get('email')
        return generics.get_object_or_404(CustomUser, email=email)
    
class SignupView(generics.CreateAPIView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response({"message": "User created successfully!", "user": serializer.data}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        print(email, password)
        if not email or not password:
            return Response({'detail': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    if user.is_authenticated:
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
        })
    return Response({"error": "Not authenticated"}, status=401)

class UserByEmailView(APIView):
    def get(self, request):
        email = request.query_params.get('email')
        if not email:
            return Response({'error': 'Email parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
            return Response({'username': user.username})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class RecipeSubmitView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = RecipeSerializer(data=data)
        
        if serializer.is_valid():
            recipe = serializer.save(user=request.user)
            Post.objects.create(recipe=recipe)
            return Response({'message': 'Recipe submitted successfully!', 'data': serializer.data}, status=201)
        return Response({'errors': serializer.errors}, status=400)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_recipes(request):
    if request.user.is_authenticated:
        recipes = Recipe.objects.filter(user=request.user).select_related('user')
        serializer = RecipeSerializer(recipes, many=True)
        return Response(serializer.data)
    else:
        return Response({"detail": "Authentication credentials were not provided."}, status=401)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().select_related(
        'recipe', 
        'recipe__user'
    ).prefetch_related(
        'likes',
        # Apply the fix here too
        Prefetch('comments', queryset=Comment.objects.select_related('user').order_by('-created_at')),
        Prefetch('ratings', queryset=Rating.objects.select_related('user'))
    ).annotate(
        likes_count=Count('likes'),
        average_rating=Coalesce(
            Avg('ratings__value'), 
            0.0,
            output_field=FloatField()
        )
    ).order_by('-created_at')

    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # @action(detail=True, methods=['post'])
    # def like(self, request, pk=None):
    #     post = self.get_object()
    #     user = request.user
    #     if user in post.likes.all():
    #         post.likes.remove(user)
    #     else:
    #         post.likes.add(user)
    #     return Response({'likes_count': post.total_likes()})

class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        # serializer.instance.post.update_average_rating()

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])  # Allow everyone to view, but only authenticated users can post
def get_all_posts(request):
    try:
        posts = Post.objects.all().select_related(
            'recipe', 
            'recipe__user'
        ).prefetch_related(
            'likes', 
            
            # --- THE FIX IS HERE ---
            # Instead of just 'comments', we use a Prefetch object to also grab the user for each comment.
            Prefetch('comments', queryset=Comment.objects.select_related('user').order_by('-created_at')),

            # We can do the same for ratings to be safe
            Prefetch('ratings', queryset=Rating.objects.select_related('user'))

        ).annotate(
            likes_count=Count('likes'),
            average_rating=Coalesce(
                Avg('ratings__value'), 
                0.0, 
                output_field=FloatField()
            )
        ).order_by('-created_at')

        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    except Exception as e:
        # This will now give you the exact serializer error if one still exists
        print(f"ERROR DURING SERIALIZATION: {e}")
        import traceback
        traceback.print_exc()
        return Response({"error": "Failed during serialization."}, status=500)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if user in post.likes.all():
        post.likes.remove(user)
    else:
        post.likes.add(user)

    # --- THIS IS THE UPGRADE ---
    # After updating the likes, re-fetch this single post with all its optimized data
    # This ensures the response is the single source of truth for the post's new state.
    updated_post = Post.objects.select_related(
        'recipe', 
        'recipe__user'
    ).prefetch_related(
        'likes',
        Prefetch('comments', queryset=Comment.objects.select_related('user').order_by('-created_at')),
        Prefetch('ratings', queryset=Rating.objects.select_related('user'))
    ).annotate(
        likes_count=Count('likes'),
        average_rating=Coalesce(Avg('ratings__value'), 0.0, output_field=FloatField())
    ).get(id=post_id)

    # Serialize the single, updated post object and return it
    serializer = PostSerializer(updated_post)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = CommentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(post=post, user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FavouriteRecipesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        liked_posts = Post.objects.filter(likes=request.user).select_related('recipe', 'recipe__user')
        
        # This part is now super efficient as the data is already fetched
        recipes = [post.recipe for post in liked_posts]
        
        serializer = RecipeSerializer(recipes, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_post(request, post_id):
    # print("hello")
    post = Post.objects.get(recipe_id=post_id)
    # print(post)
    user = request.user
    value = request.data.get('value')
    # print("post",post, user, value)
    if value is None or not (1 <= int(value) <= 5):
        return Response({'error': 'Invalid rating value'}, status=400)

    rating, created = Rating.objects.get_or_create(post=post, user=user, defaults={'value': value})
    if not created:
        rating.value = value
        rating.save()

    # post.update_average_rating()
    return Response({'status': 'rating updated successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_nutritional_info(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        ingredients = data.get('ingredients', '')

        app_id = os.getenv('NUTRITIONIX_APP_ID')
        app_key = os.getenv('NUTRITIONIX_APP_KEY')
        api_url = 'https://trackapi.nutritionix.com/v2/natural/nutrients'

        headers = {
            'Content-Type': 'application/json',
            'x-app-id': app_id,
            'x-app-key': app_key
        }
        payload = {
            'query': ingredients
        }

        response = requests.post(api_url, headers=headers, json=payload)

        if response.status_code == 200:
            nutrition_data = response.json()
            nutrients = nutrition_data['foods'][0]
            # print("Full Nutritionix Response:", nutrients)
            vitamin_attr_ids = [318, 323, 328, 401, 404, 405, 406, 415, 418, 430]
            total_vitamins = sum(
                nutrient['value']
                for nutrient in nutrients['full_nutrients']
                if nutrient['attr_id'] in vitamin_attr_ids
            )
            return JsonResponse({
                'calories': format(float(nutrients.get('nf_calories', 0)), '.2f'),
                'carbohydrates': format(float(nutrients.get('nf_total_carbohydrate', 0)), '.2f'),
                'protein': format(float(nutrients.get('nf_protein', 0)), '.2f'),
                'fat': format(float(nutrients.get('nf_total_fat', 0)), '.2f'),
                'vitamins': format(total_vitamins, '.2f'),
                'fiber': format(float(nutrients.get('nf_dietary_fiber', 0)), '.2f'),
            })
        else:
            return JsonResponse({'error': 'Failed to fetch nutritional information'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

genai.configure(api_key=os.getenv('GOOGLE_GENAI_API_KEY'))

logging.basicConfig(filename='generate_recommendation.log', level=logging.ERROR, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_recommendation(request):
    if request.method == 'POST':
        try:
            # models = genai.list_models()
            # for model in models:
            #     print(model.name)
            # print("Received request body:", request.body)

            # Load request data
            data = json.loads(request.body)
            nutrition = data.get('nutrition', {})
            recipe_name = data.get('recipeName', 'this recipe')

            # Validate nutrition data
            required_keys = ['calories', 'carbohydrates', 'protein', 'fat', 'vitamins']
            for key in required_keys:
                if key not in nutrition:
                    error_msg = f"Missing key in nutrition data: {key}"
                    print(error_msg)
                    logging.error(error_msg)
                    return JsonResponse({'error': error_msg}, status=400)

            # Debugging: Print nutrition details
            # print("Parsed nutrition data:", nutrition)

            # Generate prompt
            prompt = (
                f"As a friendly nutritionist, analyze the nutritional values of {recipe_name}:\n"
                f"Calories: {nutrition['calories']}\n"
                f"Carbohydrates: {nutrition['carbohydrates']}g\n"
                f"Protein: {nutrition['protein']}g\n"
                f"Fat: {nutrition['fat']}g\n"
                f"Vitamins: {nutrition['vitamins']}\n\n"
                f"Please provide a short, encouraging recommendation in 2-3 sentences. "
                f"First comment on the nutritional balance, then suggest 1-2 complementary foods or sides "
                f"that would pair well with {recipe_name} to create a balanced meal. "
                f"Keep the tone positive and friendly."
            )

            # Debugging: Print generated prompt
            # print("Generated prompt:", prompt)

            # Generate response using Gemini API
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)

            # Check if response is valid
            if not hasattr(response, 'text') or not response.text.strip():
                error_msg = "Empty or invalid response from Gemini API"
                print(error_msg)
                logging.error(error_msg)
                return JsonResponse({'error': error_msg}, status=500)

            recommendation = response.text.strip()

            # Debugging: Print AI response
            print("Generated recommendation:", recommendation)

            return JsonResponse({'recommendation': recommendation})

        except json.JSONDecodeError as e:
            error_msg = f"JSON decoding error: {str(e)}"
            print(error_msg)
            logging.error(error_msg)
            return JsonResponse({'error': error_msg}, status=400)

        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            print(error_msg)
            logging.error(error_msg, exc_info=True)
            return JsonResponse({'error': error_msg}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)
