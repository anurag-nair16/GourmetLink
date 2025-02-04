import React from 'react';
import { Route, Routes } from 'react-router-dom';
import "./index.css";
import Navbar from './components/Navbar'; // Adjust the path based on your file structure
import SubmitRecipe from './components/SubmitRecipe'; // Example of your submit recipe component
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
import HomePage from './components/HomePage';


const App = () => {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
        <Route 
            path="/" 
            element={<ProtectedRoute element={<Home />} />} 
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
            path="/home" 
            element={<ProtectedRoute element={<HomePage />} />} 
          />
          {/* Add other routes here */}
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
