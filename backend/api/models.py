from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import BaseUserManager
from django.contrib.auth.models import User
from django.conf import settings
from django.core.cache import cache

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, username, password, **extra_fields)


class CustomUser(AbstractUser):
    id = models.AutoField(primary_key=True)  # Add an id field
    email = models.EmailField(unique=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)

    objects = CustomUserManager()  # Link the custom user manager

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Add 'username' to the required fields

class Recipe(models.Model):
    name = models.CharField(max_length=255)
    ingredients = models.TextField()
    description = models.CharField(max_length=100, blank=False, null=False)
    instructions = models.TextField()
    image = models.ImageField(upload_to='images/')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recipes'
    )
    created_at = models.DateTimeField(auto_now_add=True)  # Automatically set on creation
    updated_at = models.DateTimeField(auto_now=True)  # Automatically updated on save
    prep_time = models.PositiveIntegerField(null=True, blank=True, help_text="Preparation time in minutes")
    servings = models.PositiveIntegerField(null=True, blank=True, help_text="Number of servings")
    tags = models.TextField(default=list, blank=True)

    translations = models.JSONField(default=dict, blank=True)

    def get_translation(self, language_code):
        print(f"Getting translation for {self.name} in {language_code}")
        base_data = {
            'image': self.image.url if self.image else None,
            'created_at': self.created_at.isoformat(),
        }
        
        if language_code == 'en':
            base_data.update({
                'name': self.name,
                'ingredients': self.ingredients,
                'description': self.description,
                'instructions': self.instructions,
            })
            return base_data
        
        cache_key = f'recipe_translation_{self.id}_{language_code}'
        cached_translation = cache.get(cache_key)
        if cached_translation:
            base_data.update(cached_translation)
            return base_data

        translation = self.translations.get(language_code, {})
        if translation:
            cache.set(cache_key, translation, timeout=86400)
            base_data.update(translation)
            return base_data

        print(f"No translation found for {self.name} in {language_code}")
        return None

    def set_translation(self, language_code, translated_data):
        print(f"Setting translation for {self.name} in {language_code}")
        if language_code != 'en':  # Don't store English translations
            if not self.translations:
                self.translations = {}
            self.translations[language_code] = translated_data
            self.save()

            # Update cache
            cache_key = f'recipe_translation_{self.id}_{language_code}'
            cache.set(cache_key, translated_data, timeout=86400)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Recipe"
        verbose_name_plural = "Recipes"
        ordering = ['-created_at']  # Order by the newest recipes first


class Post(models.Model):
    recipe = models.OneToOneField(Recipe, on_delete=models.CASCADE, related_name='post')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)
    average_rating = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def update_average_rating(self):
        ratings = self.ratings.all()
        self.average_rating = ratings.aggregate(models.Avg('value'))['value__avg'] or 0.0
        self.save()

    def total_likes(self):
        return self.likes.count()

    def __str__(self):
        return f"Post for {self.recipe.name}"  

class Rating(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings')
    value = models.PositiveSmallIntegerField()  # e.g., 1 to 5 stars
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')  # Ensure a user rates a post only once

    def __str__(self):
        return f"{self.user.username} rated {self.post.recipe.name}: {self.value} stars"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.recipe.name}"

