from rest_framework import serializers
from .models import MealPlanEntry, MealPlan
from api.models import Recipe

class MealPlanEntrySerializer(serializers.ModelSerializer):
    recipe_id = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all(), source="recipe")

    class Meta:
        model = MealPlanEntry
        fields = ["id", "recipe_id", "day", "meal_type", "servings"]

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

    def update(self, instance, validated_data):
        entries_data = validated_data.pop("entries", None)
        instance.name = validated_data.get("name", instance.name)
        instance.start_date = validated_data.get("start_date", instance.start_date)
        instance.end_date = validated_data.get("end_date", instance.end_date)  # Update the end_date
        instance.save()

        if entries_data is not None:
            instance.entries.all().delete()
            for entry_data in entries_data:
                MealPlanEntry.objects.create(meal_plan=instance, **entry_data)
        return instance

    def validate(self, data):
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError("End date must be later than the start date.")
        return data

    
class ShoppingListSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
