from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.core.cache import cache
import requests
import json
import logging
from .models import MealPlan
from api.models import Recipe, Post
from .serializers import MealPlanSerializer, IngredientsListSerializer, RecipeSerializer, PostSerializer
from api.serializers import RecipeSerializer
from .utils import translate_recipe
from dotenv import load_dotenv
import google.generativeai as genai
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Recipe, MealPlan
from .serializers import RecipeSerializer, MealPlanSerializer, IngredientsListSerializer
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io
import os
from decouple import config

class TranslateContent(APIView):
    parser_classes = [JSONParser]

    def get(self, request):
        return Response({
            "message": "Please use POST method with the following format",
            "example_payload": {
                "target_language": "es",
                "content": {
                    "brand_name": "Gourmet Link",
                    "nav_home": "Home"
                }
            }
        })

    def post(self, request):
        try:
            data = request.data
            target_language = data.get('target_language')
            content = data.get('content')
            print(f"Received data: {data}")
            print(f"Target language: {target_language}")
            print(f"Content: {content}")

            if not target_language or not content:
                return Response({
                    'error': 'Missing required parameters',
                    'received_data': data,
                }, status=400)

            translations = {}
            for key, text in content.items():
                # Using MyMemory Translation API
                response = requests.get(
                    "https://api.mymemory.translated.net/get",
                    params={
                        "q": text,
                        "langpair": f"en|{target_language}"
                    }
                )

                if response.status_code == 200:
                    result = response.json()
                    print(f"API response for key '{key}': {result}")
                    if result.get('responseStatus') == 200:
                        translations[key] = result['responseData']['translatedText']
                    else:
                        print(f"Translation API error for key '{key}': {result.get('responseDetails')}")
                        translations[key] = text
                else:
                    print(f"HTTP error for key '{key}': {response.status_code}")
                    translations[key] = text

                # Add a small delay to respect rate limits
                import time
                time.sleep(0.5)  # 500ms delay between requests

            print(f"Translations: {translations}")
            return Response(translations)

        except Exception as e:
            print(f"Translation error: {str(e)}")
            return Response({
                'error': f'Translation error: {str(e)}',
                'details': str(e)
            }, status=500)


# class RecipeListView(APIView):
#     def get(self, request):
#         target_language = request.query_params.get('language', 'en')
#         recipes = Recipe.objects.all()
        
#         translated_recipes = []
#         for recipe in recipes:
#             recipe_data = RecipeSerializer(recipe).data  # Full serialized data
#             translated_data = recipe.get_translation(target_language)
            
#             if not translated_data and target_language != 'en':
#                 translated_data = translate_recipe(recipe, target_language)
#                 recipe.set_translation(target_language, translated_data)
            
#             # Update only translatable fields if translation exists
#             if translated_data:
#                 recipe_data['name'] = translated_data['name']
#                 recipe_data['ingredients'] = translated_data['ingredients']
#                 recipe_data['description'] = translated_data['description']
#                 recipe_data['instructions'] = translated_data['instructions']
            
#             translated_recipes.append(recipe_data)
        
#         return Response(translated_recipes)

logger = logging.getLogger(__name__)

# class RecipeTranslationView(APIView):
#     def get(self, request, pk):
#         try:
#             language = request.query_params.get('language', 'en')
#             recipe = get_object_or_404(Recipe, pk=pk)
            
#             recipe_data = RecipeSerializer(recipe).data  # Full serialized data
            
#             if language == 'en':
#                 return Response(recipe_data)
            
#             # Try cache or stored translation
#             cache_key = f'recipe_translation_{pk}_{language}'
#             cached_translation = cache.get(cache_key)
            
#             if cached_translation:
#                 recipe_data['name'] = cached_translation['name']
#                 recipe_data['ingredients'] = cached_translation['ingredients']
#                 recipe_data['description'] = cached_translation['description']
#                 recipe_data['instructions'] = cached_translation['instructions']
#                 return Response(recipe_data)
            
#             translation = recipe.get_translation(language)
#             if translation:
#                 recipe_data['name'] = translation['name']
#                 recipe_data['ingredients'] = translation['ingredients']
#                 recipe_data['description'] = translation['description']
#                 recipe_data['instructions'] = translation['instructions']
#                 cache.set(cache_key, translation, timeout=86400)
#                 return Response(recipe_data)
            
#             # Create new translation
#             translated_data = translate_recipe(recipe, language)
#             if translated_data:
#                 recipe.set_translation(language, translated_data)
#                 cache.set(cache_key, translated_data, timeout=86400)
#                 recipe_data['name'] = translated_data['name']
#                 recipe_data['ingredients'] = translated_data['ingredients']
#                 recipe_data['description'] = translated_data['description']
#                 recipe_data['instructions'] = translated_data['instructions']
#                 return Response(recipe_data)
#             else:
#                 return Response(recipe_data)
                    
#         except Exception as e:
#             message = f"Translation error for recipe {pk}: {str(e)}"
#             logger.error(message)
#             return Response({'error': message}, status=500)

class RecipeDetailView(APIView):
    def get(self, request, pk):
        try:
            recipe = get_object_or_404(Recipe, pk=pk)
            return Response(RecipeSerializer(recipe).data)
        except Recipe.DoesNotExist:
            return Response(
                {'error': 'Recipe not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_GENAI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

class RecipeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]

class MealPlanViewSet(viewsets.ModelViewSet):
    serializer_class = MealPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MealPlan.objects.filter(user=self.request.user)

    def _aggregate_and_format_ingredients(self, meal_plan):
        # Step 1: Aggregate raw ingredients
        raw_ingredients = {}
        for entry in meal_plan.entries.all():
            for ingr in entry.recipe.ingredients.split(","):
                name = ingr.strip().lower()  # Normalize to lowercase for consistency
                if name:
                    if name in raw_ingredients:
                        raw_ingredients[name] += entry.servings
                    else:
                        raw_ingredients[name] = entry.servings

        # Step 2: Prepare input for Gemini
        ingredient_list = [f"{name}: {count} servings" for name, count in raw_ingredients.items()]
        prompt = (
            "You are tasked with creating a shopping list from the following ingredients, where each is listed with a number of servings. "
            "Your goal is to aggregate duplicate ingredients (e.g., combine 'onions' from multiple entries) and estimate a single, practical quantity "
            "in metric units (kilograms, grams, liters, milliliters) suitable for shopping. Avoid using 'servings,' 'cups,' 'small,' or 'large'—provide an "
            "above-average total amount that makes sense for a grocery list (e.g., '7 onions' might become '2 kilograms'). "
            "Return the result as a JSON array with 'name', 'quantity' (as a string), and 'unit' fields. Here's the list:\n" +
            "\n".join(ingredient_list)
        )

        # Step 3: Call Gemini API
        try:
            response = model.generate_content(prompt)
            formatted_ingredients = response.text.strip()
            # Clean up Gemini response (remove markdown if present)
            if formatted_ingredients.startswith("```json"):
                formatted_ingredients = formatted_ingredients[7:-3].strip()
            shopping_list = json.loads(formatted_ingredients)
        except Exception as e:
            print(f"Error with Gemini API: {e}")
            # Fallback: simple list with servings converted to basic units
            shopping_list = [
                {"name": name, "quantity": str(count * 100), "unit": "grams"}
                for name, count in raw_ingredients.items()
            ]
        return shopping_list

    @action(detail=True, methods=['get'])
    def ingredients(self, request, pk=None):
        meal_plan = self.get_object()
        shopping_list = self._aggregate_and_format_ingredients(meal_plan)
        serializer = IngredientsListSerializer({"items": shopping_list})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        meal_plan = self.get_object()
        shopping_list = self._aggregate_and_format_ingredients(meal_plan)

        # Generate PDF
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        p.setFont("Helvetica", 12)
        p.drawString(100, 750, f"Shopping List for {meal_plan.name}")
        y = 730
        for item in shopping_list:
            p.drawString(100, y, f"{item['quantity']} {item['unit']} {item['name']}")
            y -= 20
            if y < 50:  # New page if needed
                p.showPage()
                p.setFont("Helvetica", 12)
                y = 750
        p.showPage()
        p.save()
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="shopping_list_{meal_plan.id}.pdf"'
        return response
    

class CheatDayAPIView(APIView):
    def post(self, request):
        cuisine = request.data.get('cuisine', '')
        dish = request.data.get('dish', '')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

        # Require latitude, longitude, and at least one of cuisine or dish
        if not (latitude and longitude and (cuisine or dish)):
            return Response(
                {'error': 'At least one of cuisine or dish is required, along with latitude and longitude'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            restaurants = self.get_serpapi_restaurants(cuisine, dish, latitude, longitude)
            return Response({'restaurants': restaurants}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"SerpApi error: {str(e)}")
            return Response(
                {'error': f"Failed to fetch restaurants: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_serpapi_restaurants(self, cuisine, dish, latitude, longitude):
        api_key = config('SERPAPI_KEY')
        url = 'https://serpapi.com/search'
        # Use cuisine if provided, otherwise use dish
        query = f"{cuisine or dish} restaurants"
        params = {
            'engine': 'google_maps',
            'q': query,
            'll': f'@{latitude},{longitude},15z',
            'type': 'search',
            'api_key': api_key,
        }

        response = requests.get(url, params=params)
        response.raise_for_status()
        results = response.json().get('local_results', [])

        # Format top 5 restaurants, sorted by rating
        restaurants = [
            {
                'name': place.get('title'),
                'rating': float(place.get('rating', 0)),
                'user_ratings_total': place.get('reviews', 0),
                'vicinity': place.get('address'),
            }
            for place in sorted(results, key=lambda x: float(x.get('rating', 0)), reverse=True)[:5]
            if float(place.get('rating', 0)) >= 4.0
        ]
        return restaurants