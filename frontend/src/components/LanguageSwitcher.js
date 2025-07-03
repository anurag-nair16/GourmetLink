// import React, { useState, useEffect } from 'react';
// import { useTranslation } from '../context/TranslationContext';
// import { FaGlobe, FaSpinner } from 'react-icons/fa';

// const LanguageSwitcher = () => {
//   const { currentLanguage, setCurrentLanguage, loading } = useTranslation();
//   const [prevLanguage, setPrevLanguage] = useState(currentLanguage);

//   // Define languages
//   const languages = [
//     { code: 'en', name: 'English', flag: '🇺🇸' },
//     { code: 'es', name: 'Español', flag: '🇪🇸' },
//     { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
//     { code: 'fr', name: 'Français', flag: '🇫🇷' },
//     { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
//     { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' }
//   ];

//   useEffect(() => {
//     const savedLanguage = localStorage.getItem('language');
//     if (savedLanguage) {
//       setCurrentLanguage(savedLanguage);
//     } else {
//       setCurrentLanguage('en');
//     }
//   }, [setCurrentLanguage]);

//   const handleLanguageChange = (e) => {
//     const selectedLanguage = e.target.value;
//     if (selectedLanguage !== 'en' && prevLanguage === 'en') {
//       setPrevLanguage(selectedLanguage);
//     } else {
//       setPrevLanguage(selectedLanguage);
//     }
//     setCurrentLanguage(selectedLanguage);
//     localStorage.setItem('language', selectedLanguage);
//   };

//   return (
//     <div className="language-switcher fixed bottom-4 right-4 z-50">
//       <div className="relative group">
//         <select
//           value={currentLanguage}
//           onChange={handleLanguageChange}
//           disabled={loading}
//           className={`
//             appearance-none pl-10 pr-8 py-2 
//             bg-white text-neutral-800 
//             border border-neutral-200 
//             rounded-full shadow-lg 
//             backdrop-blur-sm cursor-pointer 
//             hover:bg-neutral-50 
//             transition-all duration-300 
//             focus:outline-none 
//             focus:ring-2 
//             focus:ring-primary-main/20 
//             focus:border-primary-main
//             disabled:opacity-50
//             disabled:cursor-not-allowed
//           `}
//         >
//           {languages.map((lang) => (
//             <option 
//               key={lang.code} 
//               value={lang.code} 
//               className="text-neutral-800 bg-white"
//             >
//               {`${lang.flag} ${lang.name}`}
//             </option>
//           ))}
//         </select>

//         <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
//           {loading && prevLanguage !== 'en' ? (
//             <FaSpinner className="w-4 h-4 text-primary-main animate-spin" />
//           ) : (
//             <FaGlobe className="w-4 h-4 text-primary-main" />
//           )}
//         </div>

//         {/* Custom dropdown arrow */}
//         <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
//           <svg 
//             className="w-4 h-4 text-neutral-400" 
//             fill="none" 
//             stroke="currentColor" 
//             viewBox="0 0 24 24"
//           >
//             <path 
//               strokeLinecap="round" 
//               strokeLinejoin="round" 
//               strokeWidth="2" 
//               d="M19 9l-7 7-7-7"
//             />
//           </svg>
//         </div>
//       </div>

//       {/* Loading tooltip */}
//       {loading && prevLanguage !== 'en' && (
//         <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2">
//           <div className="
//             bg-white 
//             text-neutral-800 
//             text-sm py-2 px-4 
//             rounded-lg 
//             shadow-lg 
//             border border-neutral-200
//             backdrop-blur-sm
//           ">
//             <div className="flex items-center gap-2">
//               <FaSpinner className="w-3 h-3 text-primary-main animate-spin" />
//               <span>Translating...</span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LanguageSwitcher;