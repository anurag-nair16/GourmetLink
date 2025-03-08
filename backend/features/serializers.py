from rest_framework import serializers
from .models import MealPlanEntry, MealPlan
from api.models import Recipe, Post

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'name', 'ingredients', 'image']  # Add 'image'

class PostSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(read_only=True)
    class Meta:
        model = Post
        fields = ['id','recipe','average_rating']

class MealPlanEntrySerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(read_only=True)
    recipe_id = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all(), source="recipe", write_only=True)

    class Meta:
        model = MealPlanEntry
        fields = ['recipe', 'recipe_id', 'day', 'meal_type', 'servings']

class MealPlanSerializer(serializers.ModelSerializer):
    entries = MealPlanEntrySerializer(many=True)
    
    # Removed 'duration' and added 'end_date'
    class Meta:
        model = MealPlan
        fields = ["id", "name", "start_date", "end_date", "entries", "created_at", "updated_at"]  # Updated fields

    def create(self, validated_data):
        entries_data = validated_data.pop("entries")
        meal_plan = MealPlan.objects.create(user=self.context["request"].user, **validated_data)
        for entry_data in entries_data:
            MealPlanEntry.objects.create(meal_plan=meal_plan, **entry_data)
        return meal_plan

    def validate(self, data):
        if data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date must be on or after start date.")
        return data

    
class IngredientsListSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()  # Accepts both string and integer values
        )
    )
