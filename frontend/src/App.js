import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import "./index.css";
import Navbar from './components/Navbar';
import SubmitRecipe from './components/SubmitRecipe';
import Footer from './components/Footer';
import Login from './components/Login';
import SignUp from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
import HomePage from './components/HomePage';
import PostDetailPage from './components/PostDetailPage';
import AllPosts from './components/AllPosts';
// Import TranslationProvider
import { TranslationProvider } from './context/TranslationContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import MealPlannerCreator from './components/MealPlanCreator';
import MealPlannerViewer from './components/MealPlanViewer';
import RecipeGenerator from './components/RecipeGenerator';
import Navigation from './components/Navigation';

const App = () => {
  useEffect(() => {
    // Function to decode the JWT token and extract the payload
    function decodeJWT(token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    }

    // Function to check if the token has expired
    function isTokenExpired(token) {
      const decodedToken = decodeJWT(token);
      const expiryTime = decodedToken.exp * 1000; // Convert expiry time to milliseconds
      return expiryTime < Date.now(); // Check if the token has expired
    }

    // Function to remove the expired token from localStorage
    function removeExpiredToken() {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        localStorage.removeItem("token");
        console.log("Token has expired and has been removed.");
      }
    }

    // Call the function to check and remove expired token on page load
    removeExpiredToken();
  }, []);
  
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top whenever the route changes
  }, [location]);

  return (
    // Wrap the entire app with TranslationProvider
    <TranslationProvider>
      <Navbar />
      <main>
        <Navigation />
        <Routes>
          <Route 
            path="/" 
            element={<HomePage />} 
          />
          <Route 
            path="/submit-recipe" 
            element={<ProtectedRoute element={<SubmitRecipe />} />} 
          />
          <Route 
            path="/login" 
            element={<Login />} 
          />
          <Route 
            path="/signup" 
            element={<SignUp />} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute element={<Profile />} />} 
          />
          <Route 
            path="/post/:postId" 
            element={<ProtectedRoute element={<PostDetailPage />} />} 
          />
          <Route 
            path="/posts" 
            element={<ProtectedRoute element={<AllPosts />} />} 
          />
          <Route 
            path="/meal-planner"
            element={<ProtectedRoute element={<MealPlannerCreator />} />}
          />
          <Route 
            path="/my-mealplans"
            element={<ProtectedRoute element={<MealPlannerViewer />} />}
          />
          <Route 
            path="/recipe-generator"
            element={<ProtectedRoute element={<RecipeGenerator />} />}
          />
        </Routes>
      </main>
      <Footer />
      {/* <LanguageSwitcher/> */}
    </TranslationProvider>
  );
};

export default App;