/**
 * Main entry point for ApiNotioTrack library
 * All dependencies should be imported here and will be bundled into script.js
 */

import { Readability } from '@mozilla/readability';
import iconSvg from '../icon.svg';
import modalTemplate from './template/modal.html';
import { detectLanguage, getTranslations } from './i18n/language-detector.js';

/**
 * Current language (will be set on initialization)
 */
let currentLanguage = null;

/**
 * Current translations (will be set on initialization)
 */
let strings = null;

/**
 * Initialize i18n system
 */
function initI18n() {
  currentLanguage = detectLanguage();
  strings = getTranslations(currentLanguage);

  // Save detected language to localStorage for future use
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('api-notiotrack-language', currentLanguage);
  }
}

/**
 * Main library object
 */
const ApiNotioTrack = {
  /**
   * Initialize the library
   */
  init() {
    initI18n();
    console.log('ApiNotioTrack initialized');
  },

  /**
   * Set language for the library
   * @param {string} lang - Language code (e.g., 'pl', 'en', 'de', 'fr', 'es')
   * @returns {boolean} True if language was set successfully
   */
  setLanguage(lang) {
    const oldLang = currentLanguage;
    currentLanguage = detectLanguage(lang);
    strings = getTranslations(currentLanguage);

    // Save to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('api-notiotrack-language', currentLanguage);
    }

    // If language changed, update existing UI elements
    if (oldLang !== currentLanguage) {
      this.updateUIForLanguage();
    }

    return currentLanguage === lang || currentLanguage === detectLanguage(lang);
  },

  /**
   * Get current language
   * @returns {string} Current language code
   */
  getLanguage() {
    return currentLanguage || detectLanguage();
  },

  /**
   * Update UI elements when language changes
   */
  updateUIForLanguage() {
    // Update badge title if it exists (find by data attribute)
    const badge = document.querySelector('[data-api-notiotrack-badge="true"]');
    if (badge) {
      badge.setAttribute('title', strings.modal.badgeTitle);
    }

    // If modal is open, update it
    const modalDialog = document.getElementById('api-notiotrack-modal');
    if (modalDialog && modalDialog.open) {
      // Rebuild modal with new translations
      modalDialog.remove();
      this.openReportModal();
    }
  },

  /**
   * Extract article title using Readability and find original DOM elements
   */
  extractArticleTitle() {
    try {
      // Clone document to avoid modifying the original during parsing
      const documentClone = document.cloneNode(true);
      const reader = new Readability(documentClone);
      const article = reader.parse();

      if (article) {
        console.log('Article title:', article.title);
        console.log(article);

        // 1. ZNAJDŹ TYTUŁ (h1) w oryginalnym dokumencie
        const titleElement = this.findElementByText(document, 'h1, h2', article.title);

        if (titleElement) {
          console.log('Found title element:', titleElement);
          // Dodaj ikonę SVG obok tytułu
          const badge = document.createElement('span');
          badge.style.display = 'inline-block';
          badge.style.verticalAlign = 'super';
          badge.style.marginLeft = '0.5em';

          // Get font size from title element (or use default)
          const titleFontSize = window.getComputedStyle(titleElement).fontSize;
          const fontSizeValue = parseFloat(titleFontSize) || 16;
          const iconHeight = fontSizeValue * 0.6;

          // Create SVG element from imported SVG string
          const svgContainer = document.createElement('div');
          svgContainer.innerHTML = iconSvg;
          const svgElement = svgContainer.querySelector('svg');

          if (svgElement) {
            // Set SVG attributes
            svgElement.style.height = `${iconHeight}px`;
            svgElement.style.width = 'auto';
            svgElement.style.display = 'inline-block';
            svgElement.style.verticalAlign = 'middle';
            // Remove fixed width/height from SVG if present
            svgElement.removeAttribute('width');
            svgElement.removeAttribute('height');
            svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            badge.appendChild(svgElement);
          }

          // Make badge clickable to open modal
          badge.style.cursor = 'pointer';
          badge.setAttribute('title', strings.modal.badgeTitle);
          badge.setAttribute('data-api-notiotrack-badge', 'true'); // Mark badge for easy finding
          badge.addEventListener('click', () => {
            this.openReportModal();
          });

          titleElement.appendChild(badge);
        } else {
          console.log('Title element not found in original document');
        }

        // 2. ZNAJDŹ CAŁY ARTYKUŁ (kontener) w oryginalnym dokumencie
        const articleElement = this.findArticleContainer(document, article.textContent);

        if (articleElement) {
          console.log('Found article container:', articleElement);
          articleElement.style.border = '2px solid blue';
        } else {
          console.log('Article container not found in original document');
        }

        return article.title;
      } else {
        console.log('No article found');
        return null;
      }
    } catch (error) {
      console.error('Error extracting article title:', error);
      return null;
    }
  },

  /**
   * Find element by text content - finds element containing most words from the title
   * @param {Document} root - Root element to search in
   * @param {string} selector - CSS selector (e.g., 'h1, h2')
   * @param {string} titleText - Title text from Readability (may contain extra words like site name)
   * @returns {HTMLElement|null}
   */
  findElementByText(root, selector, titleText) {
    const elements = root.querySelectorAll(selector);

    // Tokenize title text into words (remove special chars, split by whitespace)
    const titleWords = titleText
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
      .split(/\s+/)
      .filter(word => word.length > 0); // Remove empty strings

    if (titleWords.length === 0) {
      return null;
    }

    let bestMatch = null;
    let bestScore = 0;

    for (let el of elements) {
      const elText = el.textContent.trim().toLowerCase();

      // Tokenize element text
      const elWords = elText
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0);

      // Count how many words from title are found in element
      let matchCount = 0;
      for (let titleWord of titleWords) {
        if (elWords.includes(titleWord)) {
          matchCount++;
        }
      }

      // Calculate match score (percentage of title words found)
      const matchScore = matchCount / titleWords.length;

      // Update best match if this one has more matching words
      if (matchScore > bestScore) {
        bestScore = matchScore;
        bestMatch = el;
      }
    }

    // Return best match if at least 50% of words match
    return bestScore >= 0.5 ? bestMatch : null;
  },

  /**
   * Find article container element
   * @param {Document} root - Root element to search in
   * @param {string} articleText - Full article text content
   * @returns {HTMLElement|null}
   */
  findArticleContainer(root, articleText) {
    // Spróbuj semantycznych tagów
    let container = root.querySelector('article, [role="main"], main');

    if (container) return container;

    // Znajdź element zawierający najwięcej tekstu z artykułu
    const candidates = root.querySelectorAll('div, section');
    const targetLength = articleText.length;
    let bestMatch = null;
    let bestScore = 0;

    for (let el of candidates) {
      const elText = el.textContent.trim();
      const similarity = elText.length / targetLength;

      // Szukamy elementu o podobnej długości tekstu (0.8-1.2x)
      if (similarity >= 0.8 && similarity <= 1.2 && similarity > bestScore) {
        bestScore = similarity;
        bestMatch = el;
      }
    }

    return bestMatch;
  },

  /**
   * Replace placeholders in template with actual strings
   * @param {string} template - HTML template string
   * @returns {string} - Template with replaced placeholders
   */
  replaceTemplateStrings(template) {
    let result = template;

    // Replace modal title
    result = result.replace(/\{\{MODAL_TITLE\}\}/g, strings.modal.title);

    // Replace violation label
    result = result.replace(/\{\{VIOLATION_LABEL\}\}/g, strings.modal.violationLabel);

    // Replace violation options
    const violationsHtml = strings.modal.violations
      .map(violation => `<li class="violation-option">${violation}</li>`)
      .join('\n                ');
    result = result.replace(/\{\{VIOLATION_OPTIONS\}\}/g, violationsHtml);

    // Replace placeholders
    result = result.replace(/\{\{EMAIL_PLACEHOLDER\}\}/g, strings.modal.emailPlaceholder);
    result = result.replace(/\{\{ADDITIONAL_INFO_PLACEHOLDER\}\}/g, strings.modal.additionalInfoPlaceholder);
    result = result.replace(/\{\{SUBMIT_BUTTON\}\}/g, strings.modal.submitButton);

    // Replace icon SVG - parse SVG string and add inline styles
    // Extract SVG element from the string (remove XML declaration if present)
    let svgContent = iconSvg.trim();
    // Remove XML declaration if present
    svgContent = svgContent.replace(/^<\?xml[^>]*\?>\s*/i, '');
    // Extract SVG tag and its content
    const svgMatch = svgContent.match(/<svg[^>]*>[\s\S]*<\/svg>/i);
    if (svgMatch) {
      let svgHtml = svgMatch[0];
      // Remove width and height attributes if present
      svgHtml = svgHtml.replace(/\s+(width|height)=["'][^"']*["']/gi, '');
      // Add style attribute for sizing
      svgHtml = svgHtml.replace(/<svg([^>]*)>/i, '<svg$1 style="width: 30px; height: 30px; display: inline-block; vertical-align: middle; preserveAspectRatio: xMidYMid meet;">');
      result = result.replace(/\{\{ICON_SVG\}\}/g, svgHtml);
    } else {
      result = result.replace(/\{\{ICON_SVG\}\}/g, '');
    }

    return result;
  },

  /**
   * Open report modal dialog
   */
  openReportModal() {
    // Check if modal already exists
    let modalDialog = document.getElementById('api-notiotrack-modal');

    if (!modalDialog) {
      // Replace placeholders in template with actual strings
      const templateWithStrings = this.replaceTemplateStrings(modalTemplate);

      // Extract dialog content and styles from template
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateWithStrings, 'text/html');

      // Get styles from template
      const styles = doc.querySelector('style');

      // Get dialog element from template
      const templateDialog = doc.querySelector('dialog');

      if (templateDialog) {
        // Create new dialog element
        modalDialog = document.createElement('dialog');
        modalDialog.id = 'api-notiotrack-modal';
        modalDialog.className = 'modal';

        // Copy content from template (without the dialog tag itself)
        const dialogContent = templateDialog.innerHTML;
        modalDialog.innerHTML = dialogContent;

        // Add styles to document if not already present
        if (styles && !document.getElementById('api-notiotrack-modal-styles')) {
          const styleElement = document.createElement('style');
          styleElement.id = 'api-notiotrack-modal-styles';
          styleElement.textContent = styles.textContent;
          document.head.appendChild(styleElement);
        }

        // Add close button functionality
        const submitButton = modalDialog.querySelector('.submit-button');
        if (submitButton) {
          submitButton.addEventListener('click', () => {
            modalDialog.close();
          });
        }

        // Close on backdrop click
        modalDialog.addEventListener('click', (e) => {
          if (e.target === modalDialog) {
            modalDialog.close();
          }
        });

        // Add to document
        document.body.appendChild(modalDialog);
      }
    }

    // Open the modal
    if (modalDialog) {
      modalDialog.showModal();
    }
  }
};

// Auto-initialize i18n and extract article title when script is loaded
if (typeof document !== 'undefined') {
  // Initialize i18n first
  initI18n();

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ApiNotioTrack.extractArticleTitle();
    });
  } else {
    // DOM is already ready
    ApiNotioTrack.extractArticleTitle();
  }
}

// Export for bundling
export default ApiNotioTrack;
