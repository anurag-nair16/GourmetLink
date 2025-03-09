import React, { useState, useEffect } from "react";
import { FaHome, FaUtensils, FaSignInAlt, FaUserPlus, FaUser, FaSignOutAlt, FaTimes, FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import LogoutPopup from "./forms/LogoutPopup";
import { useTranslation } from '../context/TranslationContext';
import { FaGlobe, FaSpinner } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const handleLogoutClick = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);
  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const { currentLanguage, setCurrentLanguage, loading } = useTranslation();
  const [prevLanguage, setPrevLanguage] = useState(currentLanguage);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' }
  ];

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    } else {
      setCurrentLanguage('en');
    }
  }, [setCurrentLanguage]);

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    if (selectedLanguage !== 'en' && prevLanguage === 'en') {
      setPrevLanguage(selectedLanguage);
    } else {
      setPrevLanguage(selectedLanguage);
    }
    setCurrentLanguage(selectedLanguage);
    localStorage.setItem('language', selectedLanguage);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out ${
        scrollY > 50 ? 'h-16' : 'h-20'
      }`}>
        <div 
          className="absolute inset-0 bg-gradient-to-r from-gray-900 via-teal-900 to-gray-900 
          opacity-90 backdrop-blur-xl transition-all duration-500"
          style={{
            background: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, 
              rgba(20, 184, 166, 0.2), transparent 80%), 
              linear-gradient(to right, #111827, #0d9488, #111827)`
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative h-full">
          <div className="flex justify-between items-center h-full">
          <Link to="/" className="flex items-center space-x-3 group relative">
  <div className="relative">
    <FaUtensils 
      className="h-10 w-10 text-yellow-400 transform transition-all duration-300 
        group-hover:scale-125 group-hover:-translate-y-1" 
    />
    {/* Glowing pulse effect */}
    <div 
      className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl 
        opacity-50 group-hover:opacity-100 group-hover:scale-110 
        transition-all duration-300 animate-pulse-slow" 
    />
    {/* Subtle orbiting particle (spark or flame-like) */}
    <div 
      className="absolute -inset-2 opacity-0 group-hover:opacity-100 
        transition-opacity duration-300"
    >
      <div 
        className="w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 
          rounded-full animate-orbit absolute top-0 left-0" 
      />
    </div>
  </div>
  <span 
    className="text-3xl font-extrabold text-white tracking-tight 
      bg-clip-text bg-gradient-to-r from-yellow-400 to-teal-400 
      group-hover:text-transparent transition-all duration-300"
  >
    Gourmet Link
  </span>
</Link>

            <div className="hidden lg:flex items-center justify-center h-full">
              <div className="flex items-center space-x-2 bg-gray-900/20 backdrop-blur-md 
                rounded-full p-2 shadow-inner border border-teal-500/20">
                {isAuthenticated ? (
                  <>
                    <NavItem icon={<FaHome />} text="Home" to="/" scrollY={scrollY} />
                    <NavItem icon={<FaUtensils />} text="Submit" to="/submit-recipe" scrollY={scrollY} />
                    <NavItem icon={<FaUser />} text="Meal Plan" to="/meal-planner" scrollY={scrollY} />
                    <NavItem icon={<FaUser />} text="Profile" to="/profile" scrollY={scrollY} />
                    <NavItem 
                      icon={<FaSignOutAlt />} 
                      text="Logout" 
                      onClick={handleLogoutClick}
                      scrollY={scrollY}
                      extraClass="hover:bg-red-500/30" 
                    />
                  </>
                ) : (
                  <>
                    <NavItem icon={<FaHome />} text="Home" to="/" scrollY={scrollY} />
                    <NavItem icon={<FaSignInAlt />} text="Login" to="/login" scrollY={scrollY} />
                    <NavItem icon={<FaUserPlus />} text="Signup" to="/signup" scrollY={scrollY} />
                  </>
                )}
                <div className="h-6 w-px bg-teal-500/30 mx-2" />
              </div>
            </div>

            <button
              className="lg:hidden relative p-2 rounded-full bg-gray-900/30 backdrop-blur-md 
                border border-teal-500/20 hover:bg-teal-500/20 transition-all duration-300 z-50"
              onClick={toggleMenu}
            >
              <div className="absolute inset-0 bg-teal-500/10 rounded-full animate-pulse" />
              {isOpen ? <FaTimes size={24} className="text-white relative z-10" /> : 
                <FaBars size={24} className="text-white relative z-10" />}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div 
          className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-gray-900/95 backdrop-blur-xl 
            shadow-lg transform transition-all duration-300 ease-in-out z-40 ${
              isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}
        >
          <div className="flex flex-col h-full px-6 py-6">
            {/* Logo and Name at Top */}
            <Link to="/" className="flex items-center space-x-3 mb-8 group" onClick={toggleMenu}>
              <div className="relative">
                <FaUtensils className="h-8 w-8 text-yellow-400 transform transition-all duration-300 
                  group-hover:scale-110 group-hover:rotate-45" />
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md 
                  group-hover:bg-yellow-400/30 transition-all duration-300" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight 
                bg-clip-text bg-gradient-to-r from-yellow-400 to-teal-400 
                group-hover:text-transparent transition-all duration-300">
                Gourmet Link
              </span>
            </Link>

            <div className="flex-1 space-y-3">
              {isAuthenticated ? (
                <>
                  <SidebarItem icon={<FaHome />} text="Home" to="/" onClick={toggleMenu} />
                  <SidebarItem icon={<FaUtensils />} text="Submit Recipe" to="/submit-recipe" onClick={toggleMenu} />
                  <SidebarItem icon={<FaUser />} text="Meal Plan" to="/meal-planner" onClick={toggleMenu} />
                  <SidebarItem icon={<FaUser />} text="Profile" to="/profile" onClick={toggleMenu} />
                  <SidebarItem 
                    icon={<FaSignOutAlt />} 
                    text="Logout" 
                    onClick={() => {
                      handleLogoutClick();
                      toggleMenu();
                    }}
                    extraClass="hover:bg-red-500/20"
                  />
                </>
              ) : (
                <>
                  <SidebarItem icon={<FaHome />} text="Home" to="/" onClick={toggleMenu} />
                  <SidebarItem icon={<FaSignInAlt />} text="Login" to="/login" onClick={toggleMenu} />
                  <SidebarItem icon={<FaUserPlus />} text="Signup" to="/signup" onClick={toggleMenu} />
                </>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-teal-500/30">
              <div className="relative group">
                <select
                  value={currentLanguage}
                  onChange={handleLanguageChange}
                  disabled={loading}
                  className={`w-full appearance-none pl-10 pr-8 py-2 bg-gray-800/80 text-white 
                    border border-teal-500/30 rounded-lg shadow-md backdrop-blur-sm cursor-pointer 
                    hover:bg-gray-700/80 transition-all duration-300 focus:outline-none 
                    focus:ring-2 focus:ring-teal-500 disabled:opacity-50`}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="text-white bg-gray-900">
                      {`${lang.flag} ${lang.name}`}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {loading && prevLanguage !== 'en' ? (
                    <FaSpinner className="w-4 h-4 text-teal-400 animate-spin" />
                  ) : (
                    <FaGlobe className="w-4 h-4 text-teal-400" />
                  )}
                </div>
              </div>
              {loading && prevLanguage !== 'en' && (
                <div className="mt-2 text-center text-teal-400 text-sm animate-pulse">
                  Translating...
                </div>
              )}
            </div>
          </div>
        </div>

        {isOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={toggleMenu}
          />
        )}
      </nav>

      <LogoutPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onConfirm={handleConfirmLogout}
      />
      
      <div className={`transition-all duration-500 ${
        scrollY > 50 ? 'h-16' : 'h-20'
      }`}></div>
    </>
  );
};

const NavItem = ({ icon, text, to, onClick, scrollY, extraClass = '' }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex items-center space-x-2 text-white px-4 py-2 rounded-full 
        transition-all duration-300 group overflow-hidden ${extraClass} ${
          scrollY > 50 ? 'text-sm' : 'text-base'
        }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 
        transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
      <span className="relative z-10 flex items-center space-x-2">
        <span className="transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </span>
        <span className="bg-clip-text group-hover:text-transparent 
          group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-yellow-400 
          transition-all duration-300">
          {text}
        </span>
      </span>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute w-1 h-1 bg-teal-400 rounded-full animate-particle top-1/4 left-1/4" />
        <div className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-particle top-3/4 right-1/4" />
      </div>
    </Link>
  );
};

const SidebarItem = ({ icon, text, to, onClick, extraClass = '' }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex items-center space-x-3 text-white px-4 py-3 rounded-lg 
        transition-all duration-300 group overflow-hidden hover:bg-teal-700/50 hover:shadow-md 
        border border-teal-500/10 ${extraClass}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/30 to-teal-500/0 
        transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
      <span className="relative z-10 flex items-center space-x-3">
        <span className="text-xl transform group-hover:scale-110 transition-transform duration-300 text-teal-400">
          {icon}
        </span>
        <span className="text-base font-medium group-hover:text-teal-300 transition-colors duration-300">
          {text}
        </span>
      </span>
    </Link>
  );
};

export default Navbar;