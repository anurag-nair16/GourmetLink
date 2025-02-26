import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('preferredLanguage') || 'en'
  );
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);

  const staticContent = {
      "brand_name": "Gourmet Link",
      "nav_home": "Home",
      "nav_login": "Login",
      "nav_signup": "Signup",
      "nav_submit_recipe": "Submit Recipe",
      "nav_profile": "Profile",
      "nav_logout": "Logout",

      // Hero Section
      'hero_cook': 'Cook',
      'hero_share': 'Share',
      'hero_enjoy': 'Enjoy',
      'hero_description': 'Join our culinary community where passion meets plate. Share your recipes, discover new flavors, and connect with food lovers worldwide.',
      'btn_share_recipe': 'Share Your Recipe',
      'btn_explore_recipes': 'Explore Recipes',
      
      // Features Section
      'features_title': 'Why Choose Our Platform?',
      'feature_share_recipes': 'Share Recipes',
      'feature_share_recipes_desc': 'Upload and share your favorite recipes with the community',
      'feature_discover': 'Discover',
      'feature_discover_desc': 'Find new and exciting recipes from around the world',
      'feature_save_favorites': 'Save Favorites',
      'feature_save_favorites_desc': 'Save recipes you love and build your personal cookbook',
      'feature_community': 'Community',
      'feature_community_desc': 'Connect with other food lovers and share your experiences',
      
      // Featured Recipes Section
      'featured_recipes_title': 'Featured Recipes',
      'btn_explore_all': 'Explore All Recipes',
      
      // Call to Action Section
      'cta_title': 'Ready to Start Your Culinary Journey?',
      'cta_description': 'Join our community of food lovers and share your recipes with the world',
      'btn_get_started': 'Get Started',
      'recipe_by': 'by',
      'ratings_count': 'ratings',

      'nutritional_analysis': 'Nutritional Analysis',
      'rate_recipe': 'Rate this Recipe',
      'submit': 'Submit',
      'ingredients': 'Ingredients',
      'instructions': 'Instructions',
      'recipe_mins': 'min',
      'recipe_servings': 'servings',
      'comments': 'Comments',
      'add_comment_placeholder': 'Add a comment...',
      'nutritional_information': 'Nutritional Information',
      'analyzing_nutrition': 'Analyzing nutritional content...',
      'please_wait': 'This may take a few seconds',
      'calories': 'Calories',
      'carbohydrates': 'Carbohydrates',
      'protein': 'Protein',
      'fat': 'Fat',
      'fiber': 'Fiber',
      'vitamins': 'Vitamins',
  };

  const translateContent = async (language) => {
    if (language === 'en') {
      setTranslations({});
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/features/translate/`, {
        target_language: language,
        content: staticContent
      });

      setTranslations(response.data);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to translate dynamic content (recipes)
  const translateRecipe = async (recipeId, language) => {
    try {
      const token = localStorage.getItem('token');
      console.log(token)
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/features/recipes/${recipeId}/translate/?language=${language}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error translating recipe:', error);
      return null;
    }
  };

  useEffect(() => {
    localStorage.setItem('preferredLanguage', currentLanguage);
    translateContent(currentLanguage);
  }, [currentLanguage]);

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      setCurrentLanguage,
      translations,
      loading,
      translateRecipe
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};