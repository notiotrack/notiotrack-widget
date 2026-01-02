/**
 * Language detection utility
 * Detects user's preferred language from various sources
 */

import { translations, defaultLanguage, supportedLanguages } from './translations.js';

/**
 * Detect user's language from multiple sources
 * Priority:
 * 1. Explicitly set language (localStorage)
 * 2. HTML lang attribute
 * 3. navigator.language
 * 4. navigator.languages (first supported)
 * 5. Default language
 *
 * @param {string|null} forcedLang - Force specific language (optional)
 * @returns {string} Language code (e.g., 'pl', 'en')
 */
export function detectLanguage(forcedLang = null) {
  // 1. Check if language is explicitly forced
  if (forcedLang && supportedLanguages.includes(forcedLang)) {
    return forcedLang;
  }

  // 2. Check localStorage for saved preference
  if (typeof localStorage !== 'undefined') {
    const savedLang = localStorage.getItem('api-notiotrack-language');
    if (savedLang && supportedLanguages.includes(savedLang)) {
      return savedLang;
    }
  }

  // 3. Check navigator.language
  if (typeof navigator !== 'undefined' && navigator.language) {
    const navLang = navigator.language.split('-')[0].toLowerCase();
    if (supportedLanguages.includes(navLang)) {
      return navLang;
    }
  }

  // 4. Check navigator.languages (browser's language preferences)
  if (typeof navigator !== 'undefined' && navigator.languages) {
    for (let lang of navigator.languages) {
      const langCode = lang.split('-')[0].toLowerCase();
      if (supportedLanguages.includes(langCode)) {
        return langCode;
      }
    }
  }

  // 5. Check HTML lang attribute
  if (typeof document !== 'undefined' && document.documentElement) {
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      const langCode = htmlLang.split('-')[0].toLowerCase();
      if (supportedLanguages.includes(langCode)) {
        return langCode;
      }
    }
  }

  // 6. Fallback to default
  return defaultLanguage;
}

/**
 * Get translations for a specific language
 * @param {string} lang - Language code
 * @returns {object} Translations object
 */
export function getTranslations(lang = null) {
  const detectedLang = detectLanguage(lang);
  return translations[detectedLang] || translations[defaultLanguage];
}
