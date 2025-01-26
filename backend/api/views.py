from rest_framework import generics
from rest_framework.response import Response
from .serializers import UserSerializer
from django.contrib.auth import authenticate, login
from .models import CustomUser  # Import CustomUser
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Recipe
from .serializers import RecipeSerializer

class SignupView(generics.CreateAPIView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User created successfully!", "user": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

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
            "username": user.username,
            "email": user.email,
        })
    return Response({"error": "Not authenticated"}, status=401)


# class RecipeSubmitView(APIView):
#     permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

#     def post(self, request, *args, **kwargs):
#         # Create a mutable copy of request.data
#         data = request.data.copy()

#         # Add the logged-in user to the request data
#         data['user'] = request.user.id

#         # Pass the mutable copy to the serializer
#         serializer = RecipeSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save(user=request.user)  # Associate the recipe with the logged-in user
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Recipe
from .serializers import RecipeSerializer
from rest_framework.parsers import MultiPartParser, FormParser

class RecipeSubmitView(APIView):
    # permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    # def post(self, request, *args, **kwargs):
    #     # Create a mutable copy of request.data
    #     data = request.data.copy()

    #     # Add the logged-in user to the request data
    #     data['user'] = request.user.id

    #     # Validate ingredients - ensuring it's a non-empty string
    #     ingredients = data.get('ingredients', '').strip()
    #     if not ingredients or all(ingredient.strip() == "" for ingredient in ingredients.split(',')):
    #         return Response({"ingredients": "At least one valid ingredient is required."}, status=status.HTTP_400_BAD_REQUEST)
    #     data['ingredients'] = ingredients  # Cleaned ingredients

    #     # Add more field validations if needed (for example, cooking time or servings)
    #     if 'cookingTime' in data and not data['cookingTime'].isdigit():
    #         return Response({"cookingTime": "Cooking time must be a valid integer."}, status=status.HTTP_400_BAD_REQUEST)
    #     if 'servings' in data and not data['servings'].isdigit():
    #         return Response({"servings": "Servings must be a valid integer."}, status=status.HTTP_400_BAD_REQUEST)

    #     # Pass the mutable copy to the serializer
    #     serializer = RecipeSerializer(data=data)

    #     if serializer.is_valid():
    #         # Save the recipe, associating it with the logged-in user
    #         recipe = serializer.save(user=request.user)

    #         # Return the created recipe's data in the response
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)

    #     # If the serializer is not valid, return errors
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = RecipeSerializer(data=data)
        
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({'message': 'Recipe submitted successfully!', 'data': serializer.data}, status=201)
        return Response({'errors': serializer.errors}, status=400)

    
# @api_view(['POST'])
# def submit_recipe(request):
#     print(request.data)
#     try:
#         # Split ingredients string into a list
#         ingredients = request.data.get('ingredients', '').strip()

#         # Ensure ingredients is not an empty string or just spaces/comma
#         if not ingredients or all(ingredient.strip() == "" for ingredient in ingredients.split(',')):
#             return Response({"ingredients": "At least one valid ingredient is required."}, status=status.HTTP_400_BAD_REQUEST)

#         # Create a new dictionary with updated ingredients
#         data = request.data.copy()  # Copy the original request data
#         data['ingredients'] = ingredients  # Update ingredients field with the split list
#         user_id = request.user.id  # Get the authenticated user's ID
#         data['user'] = user_id 

#         print(f"Data being submitted: {data}")
#         # Proceed with serializer validation and saving
#         serializer = RecipeSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({"message": "Recipe submitted successfully!"}, status=status.HTTP_201_CREATED)
#         else:
#             print(serializer.errors)  # Log the errors to check what's wrong
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#     except Exception as e:
#         return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_user_recipes(request):
    if request.user.is_authenticated:
        recipes = Recipe.objects.filter(user=request.user)
        serializer = RecipeSerializer(recipes, many=True)
        return Response(serializer.data)
    else:
        return Response({"detail": "Authentication credentials were not provided."}, status=401)