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
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
import json


# Configure the Gemini API
genai.configure(api_key=settings.GOOGLE_GENAI_API_KEY_2)

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_ai_meal_plan(request):
    try:
        # Configure Gemini
        genai.configure(api_key=settings.GOOGLE_GENAI_API_KEY_2)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Get data from request
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        preferences = request.data.get('preferences', {})
        available_recipes = request.data.get('recipes', [])

        # Format the recipes for better prompt
        recipes_text = "\n".join([
            f"- {recipe['recipe']['name']} (ID: {recipe['recipe']['id']}, Rating: {recipe['average_rating']})"
            for recipe in available_recipes
        ])

        # Create prompt for Gemini with proper JSON example
        prompt = f"""
        Task: Create a meal plan from {start_date} to {end_date}

        User Preferences:
        - Dietary Restrictions: {preferences.get('dietaryRestrictions', 'None')}
        - Cuisine Preference: {preferences.get('cuisinePreference', 'Any')}
        - Target Daily Calories: {preferences.get('calories', 'Not specified')}
        - Allergies: {', '.join(preferences.get('allergies', ['None']))}

        Available Recipes:
        {recipes_text}

        Create a meal plan that:
        1. Uses only the available recipes listed above (use their exact IDs)
        2. Provides 3 meals per day (breakfast, lunch, dinner)
        3. Matches cuisine preferences when possible
        4. Prioritizes higher-rated recipes
        5. Distributes recipes evenly across the week
        6. Avoids repetition when possible

        Return ONLY a JSON object in this exact format:
        {{
            "entries": [
                {{
                    "day": 1,
                    "meal_type": "breakfast",
                    "recipe_id": 123,
                    "servings": 1
                }}
            ]
        }}

        Important:
        - recipe_id must be a number, not a string
        - meal_type must be one of: "breakfast", "lunch", "dinner"
        - day must be a number starting from 1
        - servings should be 1
        - Only use recipe IDs from the available recipes list
        - Generate entries for all meals for all days between {start_date} and {end_date}
        """

        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        try:
            # Extract JSON from the response
            import re
            json_match = re.search(r'\{[\s\S]*\}', response.text)
            if not json_match:
                raise ValueError("No JSON found in the response")
            
            meal_plan = json.loads(json_match.group())
            
            # Validate the response structure
            if "entries" not in meal_plan:
                raise ValueError("Invalid response format: missing 'entries' key")
            
            # Validate each entry
            available_recipe_ids = {str(r['recipe']['id']) for r in available_recipes}
            valid_meal_types = {"breakfast", "lunch", "dinner"}
            
            for entry in meal_plan["entries"]:
                # Check required keys
                required_keys = ["day", "meal_type", "recipe_id", "servings"]
                if not all(key in entry for key in required_keys):
                    raise ValueError(f"Invalid entry format: missing required keys - {entry}")
                
                # Validate meal_type
                if entry["meal_type"] not in valid_meal_types:
                    raise ValueError(f"Invalid meal_type: {entry['meal_type']}")
                
                # Validate recipe_id
                if str(entry["recipe_id"]) not in available_recipe_ids:
                    raise ValueError(f"Invalid recipe_id: {entry['recipe_id']}")
                
                # Ensure recipe_id is an integer
                entry["recipe_id"] = int(entry["recipe_id"])
                
                # Ensure day is an integer
                entry["day"] = int(entry["day"])
                
                # Ensure servings is an integer
                entry["servings"] = int(entry["servings"])

            return Response(meal_plan)

        except json.JSONDecodeError as e:
            raise ValueError(f"Could not parse AI response as JSON: {str(e)}")
        except Exception as e:
            raise ValueError(f"Error processing AI response: {str(e)}")

    except Exception as e:
        print(f"Error in generate_ai_meal_plan: {str(e)}")
        return Response(
            {
                "error": "Failed to generate meal plan",
                "detail": str(e)
            },
            status=400
        )
    
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