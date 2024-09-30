from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Recipe  # Ensure to import your Recipe model
from .serializers import RecipeSerializer, UserSerializer, LoginSerializer  # Ensure to import your serializer
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from django.contrib.auth.models import User


def home(request):
    return HttpResponse("Hello, world. You're at the home page.")

class RecipeViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Recipe.objects.all()  # Change query_set to queryset
    serializer_class = RecipeSerializer  # Change serializer to serializer_class

    def list(self, request):
        queryset = self.queryset  # Use self.queryset
        serializer = self.serializer_class(queryset, many=True)  # Use self.serializer_class
        return Response(serializer.data)

    def create(self, request):
        serializer = self.serializer_class(data=request.data)  # Use self.serializer_class
        if serializer.is_valid(): 
            serializer.save(user=request.user)
            return Response(serializer.data)
        else: 
            return Response(serializer.errors, status=400)

    def retrieve(self, request, pk=None):
        recipe = self.queryset.get(id=pk)  # Change project to recipe
        serializer = self.serializer_class(recipe)  # Use self.serializer_class
        return Response(serializer.data)

    def update(self, request, pk=None):
        recipe = self.queryset.get(pk=pk)  # Change project to recipe
        serializer = self.serializer_class(recipe, data=request.data)  # Use self.serializer_class
        if serializer.is_valid(): 
            serializer.save()
            return Response(serializer.data)
        else: 
            return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        recipe = self.queryset.get(pk=pk)  # Change project to recipe
        recipe.delete()  # Change project to recipe
        return Response(status=204)

class SignupView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "Signup successful!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from django.contrib.auth import login
class LoginView(APIView):
    def post(self, request):
        print("Request data:", request.data)  # Print the incoming data
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            # Here, you may need to find the user by email instead of username
            try:
                user = User.objects.get(email=email)
                if user.check_password(password):  # Check password using Django's method
                    login(request,user)
                    return Response({"message": "Login successful!"}, status=status.HTTP_200_OK)
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        print("Serializer errors:", serializer.errors)  # Print validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

