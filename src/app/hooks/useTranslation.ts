"use client";

import { useState, useEffect } from 'react';

interface TranslationData {
  [key: string]: any;
}

export function useTranslation() {
  const [translations, setTranslations] = useState<TranslationData>({});
  const [locale, setLocale] = useState<string>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Detect current locale from URL or default to 'en'
    const path = window.location.pathname;
    const localeFromPath = path.split('/')[1];
    const supportedLocales = ['en', 'si', 'ta'];
    const currentLocale = supportedLocales.includes(localeFromPath) ? localeFromPath : 'en';
    
    setLocale(currentLocale);
    
    // Load translations
    loadTranslations(currentLocale);
  }, []);

  const loadTranslations = async (locale: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/locales/${locale}/common.json`);
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to English if loading fails
      if (locale !== 'en') {
        const fallbackResponse = await fetch('/locales/en/common.json');
        const fallbackData = await fallbackResponse.json();
        setTranslations(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string, fallback?: any): any => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    return value !== undefined ? value : fallback || key;
  };

  return { t, locale, loading, translations };
}