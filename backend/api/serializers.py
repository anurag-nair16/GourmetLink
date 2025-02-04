from rest_framework import serializers
from .models import CustomUser
from .models import Recipe, Post, Rating, Comment

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


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'text', 'created_at']
        read_only_fields = ['post', 'user', 'created_at']

class RatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Rating
        fields = ['id', 'post', 'user', 'value', 'created_at']
        read_only_fields = ['post', 'user', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    likes_count = serializers.IntegerField(source='total_likes', read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    ratings = RatingSerializer(many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'recipe', 'user', 'likes', 'likes_count', 'average_rating', 'comments', 'ratings', 'created_at', 'updated_at']
        read_only_fields = ['recipe', 'user', 'created_at', 'updated_at']
