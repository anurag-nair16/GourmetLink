from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])  # Hash the password
        user.save()
        return user

class RecipeSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ('id', 'name', 'ingredients', 'instructions', 'image_url', 'created_at', 'user')  # Include 'user'

    def get_created_at(self, obj):
        return obj.created_at.date().strftime("%Y-%m-%d")

    def create(self, validated_data):
        # Ensure user is set correctly
        user_email = validated_data.pop('user')
        user = User.objects.get(email=user_email)  # Fetch user by email
        recipe = Recipe.objects.create(user=user, **validated_data)
        return recipe


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
