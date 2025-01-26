from rest_framework import serializers
from .models import CustomUser
from .models import Recipe

class RecipeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # Show the username instead of ID for the user
    ingredients = serializers.CharField()

    class Meta:
        model = Recipe
        fields = [
            'id', 'name', 'ingredients', 'instructions', 'image', 'user',
            'created_at', 'updated_at', 'prep_time', 'servings', 'tags'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']  # Auto-generated fields

    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser(
            email=validated_data['email'],
            username=validated_data['username']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
