from rest_framework import serializers
from .models import CustomUser
from .models import Recipe, Post, Rating, Comment
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'profile_image']

class SimpleUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'profile_image']

class RecipeSerializer(serializers.ModelSerializer):
    user = SimpleUserProfileSerializer(read_only=True)  # Show the username instead of ID for the user
    image_thumbnail = serializers.SerializerMethodField()
    image_large = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = [
            'id', 'name', 'ingredients', 'description', 'instructions', 
            'image', 'image_thumbnail', 'image_large', # Add new fields
            'user', 'created_at', 'updated_at', 'prep_time', 'servings', 'tags'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_image_thumbnail(self, obj):
        if obj.image:
            # Transforms: width 400, height 300, crop-fill, auto-quality, auto-format (like webp)
            return obj.image.url.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto,f_auto/')
        return None

    def get_image_large(self, obj):
        if obj.image:
            # Transforms: width 1200, auto-quality, auto-format
            return obj.image.url.replace('/upload/', '/upload/w_1200,q_auto,f_auto/')
        return None

    
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
    user = SimpleUserProfileSerializer(read_only=True)
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
    user = SimpleUserProfileSerializer(source='recipe.user', read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    average_rating = serializers.FloatField(read_only=True, default=0)
    comments = CommentSerializer(many=True, read_only=True)
    ratings = RatingSerializer(many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'recipe', 'user', 'likes', 'likes_count', 'average_rating', 
            'comments', 'created_at', 'updated_at', 'ratings'
        ]
        read_only_fields = ['recipe', 'user', 'created_at', 'updated_at']