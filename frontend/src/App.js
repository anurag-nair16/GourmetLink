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


const App = () => {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit-recipe" element={<SubmitRecipe />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Add other routes here */}
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
