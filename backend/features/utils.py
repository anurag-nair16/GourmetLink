import requests
from django.core.cache import cache
import time
import requests
import logging

def translate_text(text, target_language):
    if not text or target_language == 'en':
        return text

    # Add delay between requests to avoid rate limiting
    time.sleep(0.5)  # 500ms delay

    try:
        response = requests.get(
            "https://api.mymemory.translated.net/get",
            params={
                "q": text,
                "langpair": f"en|{target_language}",
                "de": "your-email@domain.com"  # Add your email for better rate limits
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('responseStatus') == 200:
                return result['responseData']['translatedText']
        return text
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return text


logger = logging.getLogger(__name__)

def translate_text(text, target_language):
    if not text or target_language == 'en':
        return text

    try:
        # Add delay between requests to avoid rate limiting
        time.sleep(0.5)

        response = requests.get(
            "https://api.mymemory.translated.net/get",
            params={
                "q": text,
                "langpair": f"en|{target_language}",
                "de": "your-email@domain.com"  # Add your email for better rate limits
            }
        )
        print(f"Translation API response: {response.status_code}, {response.text}")
        if response.status_code == 200:
            result = response.json()
            if result.get('responseStatus') == 200:
                translated_text = result['responseData']['translatedText']
                print(f"Successfully translated text to {target_language}: {translated_text}")
                return translated_text
            else:
                print(f"Translation API returned non-200 status: {result.get('responseStatus')}, message: {result.get('responseDetails')}")
        
        print(f"Translation failed, returning original text. Status code: {response.status_code}, message: {response.text}")
        return text
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return text

def translate_recipe(recipe, target_language):
    try:
        if target_language == 'en':
            return {
                'name': recipe.name,
                'ingredients': recipe.ingredients,
                'description': recipe.description,
                'instructions': recipe.instructions,
            }

        translated_data = {}
        fields_to_translate = ['name', 'ingredients', 'description', 'instructions']
        
        for field in fields_to_translate:
            original_text = getattr(recipe, field)
            translated_text = translate_text(original_text, target_language)
            translated_data[field] = translated_text
            logger.info(f"Translated {field} to {target_language}: {translated_text}")

        print(f"Successfully translated recipe {recipe.id} to {target_language}")
        return translated_data
    except Exception as e:
        print(f"Recipe translation error: {str(e)}")
        return None