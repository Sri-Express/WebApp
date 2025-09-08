"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' }
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);

  useEffect(() => {
    // Detect current language from URL
    const path = window.location.pathname;
    const localeFromPath = path.split('/')[1];
    const supportedLocales = ['en', 'si', 'ta'];
    const currentLocale = supportedLocales.includes(localeFromPath) ? localeFromPath : 'en';
    
    const foundLanguage = languages.find(lang => lang.code === currentLocale);
    if (foundLanguage) {
      setCurrentLanguage(foundLanguage);
    }
  }, []);

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    setIsOpen(false);
    
    // Get current pathname without locale
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}/, '') || '/';
    
    // Navigate to new locale
    router.push(`/${language.code}${pathWithoutLocale}`);
  };

  return (
    <div className="language-switcher-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`language-switcher-button ${isOpen ? 'active' : ''}`}
      >
        <span className="language-flag">{currentLanguage.flag}</span>
        <span className="language-name">{currentLanguage.name}</span>
        <ChevronDownIcon 
          className={`language-chevron ${isOpen ? 'rotate' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          <div className="language-dropdown">
            {languages.map((language, index) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={`language-option ${
                  currentLanguage.code === language.code ? 'active' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="language-option-flag">{language.flag}</span>
                <span className="language-option-name">{language.name}</span>
                {currentLanguage.code === language.code && (
                  <div className="language-option-indicator"></div>
                )}
              </button>
            ))}
          </div>
          <div 
            className="language-overlay" 
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
}