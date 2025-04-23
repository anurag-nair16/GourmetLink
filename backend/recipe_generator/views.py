# recipe_generator/views.py
import google.generativeai as genai
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import base64
from PIL import Image
import io, logging
from .models import IngredientAnalysis, GeneratedRecipe

# Configure the Gemini API
genai.configure(api_key=settings.GOOGLE_GENAI_API_KEY_2)

logger = logging.getLogger(__name__)

class AnalyzeIngredientsView(views.APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)  # Add this line

    def post(self, request):
        try:
            # Check if file exists
            if 'photo' not in request.FILES:
                return Response(
                    {'error': 'No photo provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            photo = request.FILES['photo']

            # Log file details
            logger.info(f"Received file: {photo.name}, size: {photo.size}, content_type: {photo.content_type}")

            try:
                # Configure Gemini
                if not settings.GOOGLE_GENAI_API_KEY_2:
                    raise ValueError("Gemini API key not configured")
                
                genai.configure(api_key=settings.GOOGLE_GENAI_API_KEY_2)
                
                # Convert image for Gemini
                image = Image.open(photo)
                
                # Convert image to RGB if it's in RGBA format
                if image.mode in ('RGBA', 'P'):
                    image = image.convert('RGB')
                
                # Convert to bytes
                img_byte_arr = io.BytesIO()
                image.save(img_byte_arr, format='JPEG')
                img_byte_arr = img_byte_arr.getvalue()

                # Create Gemini model
                model = genai.GenerativeModel('gemini-1.5-flash')

                # Prepare prompt
                prompt = """
                Analyze this image and list all visible ingredients.
                Format your response as a comma-separated list.
                Only include clearly visible ingredients.
                Be specific but concise.
                """

                # Generate response
                response = model.generate_content([
                    prompt,
                    {
                        "mime_type": "image/jpeg",
                        "data": img_byte_arr
                    }
                ])

                # Check if response is valid
                if not response.text:
                    raise ValueError("No response from Gemini API")

                # Process the response
                ingredients = [
                    ingredient.strip()
                    for ingredient in response.text.split(',')
                    if ingredient.strip()
                ]

                logger.info(f"Successfully detected ingredients: {ingredients}")

                return Response({
                    'ingredients': ingredients,
                })

            except Exception as e:
                logger.error(f"Error processing image with Gemini: {str(e)}", exc_info=True)
                return Response(
                    {'error': f'Error processing image: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            logger.error(f"Server error: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# recipe_generator/views.py
class GenerateRecipeView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Log incoming data
            logger.info(f"Received recipe generation request with data: {request.data}")

            ingredients = request.data.get('ingredients', [])
            preferences = request.data.get('preferences', {})

            if not ingredients:
                return Response(
                    {'error': 'No ingredients provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Configure Gemini
            if not settings.GOOGLE_GENAI_API_KEY_2:
                raise ValueError("Gemini API key not configured")
            
            genai.configure(api_key=settings.GOOGLE_GENAI_API_KEY_2)
            
            # Create Gemini model
            model = genai.GenerativeModel('gemini-1.5-flash')

            # Create a detailed prompt
            prompt = f"""
            Create a recipe using these ingredients: {', '.join(ingredients)}.
            
            Dietary Requirements:
            - Restrictions: {preferences.get('dietaryRestrictions', 'None')}
            - Allergies: {', '.join(preferences.get('allergies', []))}
            - Cuisine Preference: {preferences.get('cuisinePreference', 'Any')}
            - Meal Type: {preferences.get('mealType', 'Any')}

            Please format the recipe as follows:
            
            Recipe Name:
            [Provide a creative name for the dish]

            Preparation Time: [time in minutes]
            Cooking Time: [time in minutes]
            Total Time: [total time]
            Servings: [number of servings]

            Ingredients:
            [List all required ingredients with measurements]

            Instructions:
            [Provide numbered step-by-step instructions]

            Nutritional Information (approximate):
            - Calories:
            - Protein:
            - Carbohydrates:
            - Fat:

            Tips:
            [Add any helpful tips or variations]
            """

            # Generate response
            try:
                response = model.generate_content(prompt)
                
                if not response.text:
                    raise ValueError("No recipe generated")

                # Log successful generation
                logger.info("Recipe generated successfully")

                return Response({
                    'recipe': response.text,
                })

            except Exception as e:
                logger.error(f"Gemini API error: {str(e)}")
                return Response(
                    {'error': f'Error generating recipe: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            logger.error(f"Server error in recipe generation: {str(e)}")
            return Response(
                {'error': f'Server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Add proper logging
import logging
logger = logging.getLogger(__name__)