import React from 'react';
import { useTranslation } from './TranslationContext';

const TranslatedText = ({ children, id, dynamic = false }) => {
  const { translations, currentLanguage, loading } = useTranslation();

  if (loading) {
    return (
      <span className="inline-block relative">
        <span className="opacity-40">{children}</span>
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500/50 animate-pulse"></span>
      </span>
    );
  }

  if (currentLanguage === 'en' || dynamic) {
    return children;
  }

  return translations[id] || children;
};

export default TranslatedText;