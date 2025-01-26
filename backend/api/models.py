from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import BaseUserManager
from django.contrib.auth.models import User
from django.conf import settings

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
    
    objects = CustomUserManager()  # Link the custom user manager

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Add 'username' to the required fields

class Recipe(models.Model):
    name = models.CharField(max_length=255)
    ingredients = models.TextField()
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
    # cook_time = models.PositiveIntegerField(null=True, blank=True, help_text="Cooking time in minutes")
    servings = models.PositiveIntegerField(null=True, blank=True, help_text="Number of servings")
    tags = models.TextField(default=list, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Recipe"
        verbose_name_plural = "Recipes"
        ordering = ['-created_at']  # Order by the newest recipes first
