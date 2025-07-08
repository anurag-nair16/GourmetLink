import React, { useState, useEffect } from "react";
import { FaHome, FaUtensils, FaSignInAlt, FaUserPlus, FaUser, FaSignOutAlt, FaTimes, FaBars, FaCompass } from "react-icons/fa";
import { Link } from "react-router-dom";
import LogoutPopup from "./forms/LogoutPopup";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const handleLogoutClick = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);
  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-out
        ${scrollY > 50 
          ? 'h-16 shadow-lg bg-white border-b border-orange-100' 
          : 'h-20 bg-gradient-to-b from-white to-orange-50'
        }`}
      >
        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo Section with enhanced styling */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute -inset-2  duration-300" />
                {/* <FaUtensils 
                  className="h-8 w-8 text-orange-500 relative transition-all duration-300 group-hover:scale-110" 
                /> */}
                <img src="/videos/dishcovery.png" alt="Logo" className="h-12 w-12 relative transition-all duration-300 group-hover:scale-110" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Gourmet Link
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center h-full">
              <div className="flex items-center space-x-1">
                {isAuthenticated ? (
                  <>
                    <NavItem icon={<FaHome />} text="Home" to="/" scrollY={scrollY} />
                    <NavItem icon={<FaCompass />} text="Explore" to="/posts" scrollY={scrollY} />
                    {/* <NavItem icon={<FaUtensils />} text="Submit" to="/submit-recipe" scrollY={scrollY} /> */}
                    {/* <NavItem icon={<FaUser />} text="Meal Plan" to="/meal-planner" scrollY={scrollY} /> */}
                    {/* <NavItem icon={<FaUser />} text="Recipe Generator" to="/recipe-generator" scrollY={scrollY} /> */}
                    <NavItem icon={<FaUser />} text="Profile" to="/profile" scrollY={scrollY} />
                    <NavItem 
                      icon={<FaSignOutAlt />} 
                      text="Logout" 
                      onClick={handleLogoutClick}
                      scrollY={scrollY}
                      extraClass="text-red-600 hover:bg-red-50" 
                    />
                  </>
                ) : (
                  <>
                    <NavItem icon={<FaHome />} text="Home" to="/" scrollY={scrollY} />
                    <NavItem icon={<FaSignInAlt />} text="Login" to="/login" scrollY={scrollY} />
                    <NavItem 
                      icon={<FaUserPlus />} 
                      text="Signup" 
                      to="/signup" 
                      scrollY={scrollY}
                      extraClass="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700" 
                    />
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-md bg-gradient-to-r from-orange-50 to-orange-100
                hover:from-orange-100 hover:to-orange-200 transition-all duration-300"
              onClick={toggleMenu}
            >
              {isOpen ? 
                <FaTimes size={20} className="text-orange-600" /> : 
                <FaBars size={20} className="text-orange-600" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Sidebar with enhanced styling */}
        <div 
          className={`lg:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-2xl
            transform transition-all duration-300 ease-in-out z-40 ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Decorative side border */}
          <div className="absolute left-0 top-0 w-[3px] h-full bg-gradient-to-b from-orange-400 via-orange-500 to-orange-400" />
          
          <div className="flex flex-col h-full px-4 py-6">
            {/* Mobile Logo */}
            <div className="flex justify-between items-center mb-8 px-2">
              <Link to="/" className="flex items-center space-x-2 group" onClick={toggleMenu}>
                <div className="relative">
                  <div className="absolute -inset-2 bg-orange-100 rounded-full blur-sm group-hover:bg-orange-200 transition-colors duration-300" />
                  <FaUtensils className="h-6 w-6 text-orange-500 relative" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Culinary Connect
                </span>
              </Link>
              <button 
                onClick={toggleMenu}
                className="p-2 rounded-full hover:bg-orange-50 transition-colors duration-300"
              >
                <FaTimes size={20} className="text-orange-500" />
              </button>
            </div>

            {/* Mobile Navigation Items */}
            <div className="flex-1 space-y-1">
              {isAuthenticated ? (
                <>
                  <SidebarItem icon={<FaHome />} text="Home" to="/" onClick={toggleMenu} />
                  <SidebarItem icon={<FaCompass />} text="Explore" to="/posts" onClick={toggleMenu} />
                  {/* <SidebarItem icon={<FaUtensils />} text="Submit Recipe" to="/submit-recipe" onClick={toggleMenu} /> */}
                  {/* <SidebarItem icon={<FaUser />} text="Meal Plan" to="/meal-planner" onClick={toggleMenu} /> */}
                  {/* <SidebarItem icon={<FaUser />} text="Recipe generator" to="/recipe-generator" onClick={toggleMenu} /> */}
                  <SidebarItem icon={<FaUser />} text="Profile" to="/profile" onClick={toggleMenu} />
                  <SidebarItem 
                    icon={<FaSignOutAlt />} 
                    text="Logout" 
                    onClick={() => {
                      handleLogoutClick();
                      toggleMenu();
                    }}
                    extraClass="text-red-600 hover:bg-red-50"
                  />
                </>
              ) : (
                <>
                  <SidebarItem icon={<FaHome />} text="Home" to="/" onClick={toggleMenu} />
                  <SidebarItem icon={<FaSignInAlt />} text="Login" to="/login" onClick={toggleMenu} />
                  <SidebarItem 
                    icon={<FaUserPlus />} 
                    text="Signup" 
                    to="/signup" 
                    onClick={toggleMenu}
                    extraClass="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
            onClick={toggleMenu}
          />
        )}
      </nav>

      <LogoutPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onConfirm={handleConfirmLogout}
      />
      
      {/* Spacer */}
      <div className={`transition-all duration-300 ${
        scrollY > 50 ? 'h-16' : 'h-20'
      }`} />
    </>
  );
};

const NavItem = ({ icon, text, to, onClick, scrollY, extraClass = '' }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-lg text-gray-700
        transition-all duration-300 hover:bg-orange-50 hover:text-orange-600
        ${extraClass}`}
    >
      <span className="mr-2 transition-transform group-hover:scale-110">{icon}</span>
      <span className="font-medium">{text}</span>
    </Link>
  );
};

const SidebarItem = ({ icon, text, to, onClick, extraClass = '' }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg
        transition-all duration-300 hover:bg-orange-50 hover:text-orange-600
        ${extraClass}`}
    >
      <span className="text-lg transition-transform group-hover:scale-110">{icon}</span>
      <span className="text-base font-medium">{text}</span>
    </Link>
  );
};

export default Navbar;