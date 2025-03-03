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
from api.models import Recipe
from .serializers import MealPlanSerializer, ShoppingListSerializer
from api.serializers import RecipeSerializer
from .utils import translate_recipe


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


class RecipeListView(APIView):
    def get(self, request):
        target_language = request.query_params.get('language', 'en')
        recipes = Recipe.objects.all()
        
        translated_recipes = []
        for recipe in recipes:
            # Get cached or stored translation
            translated_data = recipe.get_translation(target_language)
            
            if not translated_data and target_language != 'en':
                # Translate and store if not exists
                translated_data = translate_recipe(recipe, target_language)
                recipe.set_translation(target_language, translated_data)
            
            # Create recipe data with translations
            recipe_data = RecipeSerializer(recipe).data
            if translated_data:
                recipe_data.update(translated_data)
            
            translated_recipes.append(recipe_data)
        
        return Response(translated_recipes)

logger = logging.getLogger(__name__)

class RecipeTranslationView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            language = request.query_params.get('language', 'en')
            user = request.user.username
            message = f"Translation requested for recipe {pk} to language {language} by user {user}"
            logger.info(message)
            # print(message)
            
            recipe = get_object_or_404(Recipe, pk=pk)
            
            if language == 'en':
                message = "Returning original English content"
                logger.debug(message)
                print(message)
                return Response(RecipeSerializer(recipe).data)
            
            # Try to get cached translation
            cache_key = f'recipe_translation_{pk}_{language}'
            cached_translation = cache.get(cache_key)
            
            if cached_translation:
                message = f"Found cached translation for recipe {pk}"
                logger.debug(message)
                print(message)
                # print(f"Cached translation: {cached_translation}")
                return Response(cached_translation)
            
            # Get translation from database if exists
            translation = recipe.get_translation(language)
            
            if translation:
                message = f"Found stored translation for recipe {pk}"
                logger.debug(message)
                print(message)
                # print(f"Stored translation: {translation}")
                cache.set(cache_key, translation, timeout=86400)
                recipe_data = RecipeSerializer(recipe).data
                recipe_data.update(translation)
                return Response(recipe_data)
            
            # If no translation exists, create one
            # message = f"Creating new translation for recipe {pk}"
            # logger.info(message)
            # print(message)
            translated_data = translate_recipe(recipe, language)
                
            if translated_data:
                recipe.set_translation(language, translated_data)
                cache.set(cache_key, translated_data, timeout=86400)
                
                recipe_data = RecipeSerializer(recipe).data
                recipe_data.update(translated_data)
                message = f"Successfully translated recipe {pk}"
                logger.info(message)
                print(message)
                # print(f"Translated data: {translated_data}")
                return Response(recipe_data)
            else:
                message = f"Translation failed for recipe {pk}, returning original content"
                logger.warning(message)
                print(message)
                return Response(RecipeSerializer(recipe).data)
                    
        except Exception as e:
            message = f"Translation error for recipe {pk}: {str(e)}"
            logger.error(message)
            print(message)
            return Response(
                {
                    'error': message,
                    'timestamp': '2025-02-26 08:50:28',
                    'requested_by': 'anurag-nair16'
                },
                status=500
            )

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
        

class RecipeListView(APIView):
    def get(self, request):
        target_language = request.query_params.get('language', 'en')
        recipes = Recipe.objects.all()
        
        translated_recipes = []
        for recipe in recipes:
            # Get cached or stored translation
            translated_data = recipe.get_translation(target_language)
            
            if not translated_data and target_language != 'en':
                # Translate and store if not exists
                translated_data = translate_recipe(recipe, target_language)
                recipe.set_translation(target_language, translated_data)
            
            # Create recipe data with translations
            recipe_data = RecipeSerializer(recipe).data
            if translated_data:
                recipe_data.update(translated_data)
            
            translated_recipes.append(recipe_data)
        
        return Response(translated_recipes)


class MealPlanViewSet(viewsets.ModelViewSet):
    serializer_class = MealPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MealPlan.objects.filter(user=self.request.user)

    @action(detail=True, methods=["get"])
    def shopping_list(self, request, pk=None):
        meal_plan = self.get_object()
        ingredients = {}
        for entry in meal_plan.entries.all():
            for ingredient in entry.recipe.ingredients:  # Assuming ingredients is a list of dicts
                name = ingredient["item"]
                qty = float(ingredient["quantity"]) * entry.servings
                unit = ingredient.get("unit", "")
                if name in ingredients:
                    ingredients[name]["quantity"] += qty
                else:
                    ingredients[name] = {"name": name, "quantity": qty, "unit": unit}
        shopping_list = list(ingredients.values())
        serializer = ShoppingListSerializer({"items": shopping_list})
        return Response(serializer.data)