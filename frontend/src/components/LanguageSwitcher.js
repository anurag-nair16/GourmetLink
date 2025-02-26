import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { FaGlobe, FaSpinner, FaTimes } from 'react-icons/fa';

const LanguageSwitcher = () => {
  const { currentLanguage, setCurrentLanguage, loading } = useTranslation();

  // Track the previous language to show the loading spinner only when switching from English
  const [prevLanguage, setPrevLanguage] = useState(currentLanguage);

  // Define languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  // Check and set the language on page load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Set default language to English
      setCurrentLanguage('en');
    }
  }, [setCurrentLanguage]);

  // Handle language change and save to local storage
  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;

    // Show the spinner only when switching from English to another language
    if (selectedLanguage !== 'en' && prevLanguage === 'en') {
      // Set loading state to true (this will trigger the spinner)
      setPrevLanguage(selectedLanguage);
    } else {
      // Otherwise, immediately update the language without showing spinner
      setPrevLanguage(selectedLanguage);
    }
    
    setCurrentLanguage(selectedLanguage);
    localStorage.setItem('language', selectedLanguage); // Save to local storage
  };


  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative group">
        <select
          value={currentLanguage}
          onChange={handleLanguageChange}
          disabled={loading}
          className={`appearance-none pl-10 pr-8 py-2 bg-gray-900/90 text-white border border-white/20 rounded-full shadow-lg backdrop-blur-sm cursor-pointer hover:bg-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50`}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code} className="text-white bg-gray-900">
              {`${lang.flag} ${lang.name}`}
            </option>
          ))}
        </select>

        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {loading && prevLanguage !== 'en' ? (
            <FaSpinner className="w-4 h-4 text-white animate-spin" />
          ) : (
            <FaGlobe className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {loading && prevLanguage !== 'en' && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2">
          <div className="bg-gray-900/90 text-white text-sm py-2 px-4 rounded-lg backdrop-blur-sm">
            Translating...
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
