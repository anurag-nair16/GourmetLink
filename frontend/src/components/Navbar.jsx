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
    window.location.href = "/";
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-teal-700 p-4 shadow-lg transition-all duration-300 ease-in-out">
      <div className="container mx-auto flex justify-between items-center px-4 xl:px-56">
        {/* Logo and Name */}
        <div className="flex items-center space-x-4">
          <FaUtensils className="h-8 w-8 text-yellow-500" aria-hidden="true" />
          <span className="text-white text-2xl font-extrabold tracking-wider">Gourmet Link</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-9">
          {isAuthenticated ? (
            <>
              <NavItem icon={<FaHome />} text="Home" to="/" />
              <NavItem icon={<FaUtensils />} text="Submit Recipe" to="/submit-recipe" />
              <NavItem icon={<FaUser />} text="Profile" to="/profile" />
              <button onClick={handleLogoutClick} className="flex items-center text-white hover:text-gray-300 transition-all duration-300 ease-in-out">
                <FaSignOutAlt />
                <span className="ml-2">Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavItem icon={<FaHome />} text="Home" to="/" />
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
        <div className="md:hidden bg-gray-900 p-4 transition-all duration-300 ease-in-out transform">
          {isAuthenticated ? (
            <>
              <NavItem icon={<FaHome />} text="Home" to="/" onClick={toggleMenu} />
              <NavItem icon={<FaUtensils />} text="Submit Recipe" to="/submit-recipe" onClick={toggleMenu} />
              <NavItem icon={<FaUser />} text="Profile" to="/profile" onClick={toggleMenu} />
              <NavItem
                icon={<FaSignOutAlt />}
                text="Logout"
                onClick={() => {
                  handleLogoutClick();
                  toggleMenu();
                }}
              />
            </>
          ) : (
            <>
              <NavItem icon={<FaHome />} text="Home" to="/" onClick={toggleMenu} />
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
      className="flex items-center space-x-2 text-white hover:text-emerald-400 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none p-2"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
};

export default Navbar;
