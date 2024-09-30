import React, { useState, useEffect } from "react";
import { FaBars, FaTimes, FaHome, FaUtensils, FaSignInAlt, FaUserPlus, FaUser, FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import LogoutPopup from "./forms/LogoutPopup";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogoutClick = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleConfirmLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem("token");
    // Redirect to the login page
    window.location.href = "/login";
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <FaUtensils className="h-8 w-8 text-yellow-500" aria-hidden="true" />
          </div>
          <span className="text-white text-xl font-bold">Gourmet Link</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <NavItem icon={<FaHome />} text="Home" to="/home" />
          <NavItem icon={<FaUtensils />} text="Submit Recipe" to="/submit-recipe" />

          {/* Conditional Rendering based on Authentication */}
          {isAuthenticated ? (
            <>
              <NavItem icon={<FaUser />} text="Profile" to="/profile" />
              <button onClick={handleLogoutClick} className="flex items-center text-white">
                <FaSignOutAlt />
                <span className="ml-2">Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavItem icon={<FaSignInAlt />} text="Login" to="/login" />
              <NavItem icon={<FaUserPlus />} text="Signup" to="/signup" />
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 p-4">
          <NavItem icon={<FaHome />} text="Home" to="/home" onClick={toggleMenu} />
          <NavItem icon={<FaUtensils />} text="Submit Recipe" to="/submit-recipe" onClick={toggleMenu} />

          {/* Conditional Rendering based on Authentication */}
          {isAuthenticated ? (
            <>
              <NavItem icon={<FaUser />} text="Profile" to="/profile" onClick={toggleMenu} />
              <NavItem
                icon={<FaSignOutAlt />}
                text="Logout"
                onClick={() => {
                  handleLogoutClick(); // Call the logout handler
                  toggleMenu(); // Then toggle the menu
                }}
              />
            </>
          ) : (
            <>
              <NavItem icon={<FaSignInAlt />} text="Login" to="/login" onClick={toggleMenu} />
              <NavItem icon={<FaUserPlus />} text="Signup" to="/signup" onClick={toggleMenu} />
            </>
          )}
        </div>
      )}



      {/* Logout Popup */}
      <LogoutPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onConfirm={handleConfirmLogout}
      />
    </nav>
  );
};

const NavItem = ({ icon, text, to, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick} // Handle logout if necessary
      className="flex items-center space-x-2 text-white hover:text-gray-300 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none p-2"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
};

export default Navbar;
