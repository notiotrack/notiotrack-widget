/**
 * Main entry point for ApiNotioTrack library
 * All dependencies should be imported here and will be bundled into script.js
 */

import { Readability } from '@mozilla/readability';
import iconSvg from '../icon.svg';
import modalTemplate from './template/modal.html';
import { detectLanguage, getTranslations } from './i18n/language-detector.js';
import { createBadgeElement } from './badge-creator.js';

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
   * Initialize badges on the page
   * Calls initBadgesOnTitles and initBadgesOnComments asynchronously
   * If no badges were added, calls initBadgesOnFooter
   */
  async initBadges() {
    const [titlesCount, commentsCount] = await Promise.all([
      this.initBadgesOnTitles(),
      this.initBadgesOnComments()
    ]);

    const totalCount = titlesCount + commentsCount;

    // If no badges were added, add badge to footer
    if (totalCount === 0) {
      await this.initBadgesOnFooter();
    }
  },

  /**
   * Initialize badges on article titles
   * @returns {Promise<number>} Number of badges added (0 or 1)
   */
  async initBadgesOnTitles() {
    try {
      // Clone document to avoid modifying the original during parsing
      const documentClone = document.cloneNode(true);
      const reader = new Readability(documentClone);
      const article = reader.parse();

      if (article) {
        console.log('Article title:', article.title);
        console.log(article);

        // Find title (h1) in original document
        const titleElement = this.findElementByText(document, 'h1, h2', article.title);

        if (titleElement) {
          console.log('Found title element:', titleElement);
          const badge = createBadgeElement(
            titleElement,
            strings.modal.badgeTitle,
            () => this.openReportModal()
          );
          titleElement.appendChild(badge);
          return 1;
        } else {
          console.log('Title element not found in original document');
        }
      } else {
        console.log('No article found');
      }
    } catch (error) {
      console.error('Error initializing badges on titles:', error);
    }
    return 0;
  },

  /**
   * Initialize badges on comments
   * Finds comment elements by class name and adds badges to them
   * @returns {Promise<number>} Number of badges added
   */
  async initBadgesOnComments() {
    try {
      let commentElements = [];

      // First, try to find elements with exact class "comment"
      commentElements = Array.from(document.querySelectorAll('.comment'));

      // If not found, look for elements with class ending with "-comment"
      if (commentElements.length === 0) {
        // Get all elements and filter by class name ending with "-comment"
        const allElements = document.querySelectorAll('*');
        commentElements = Array.from(allElements).filter(element => {
          const classList = Array.from(element.classList);
          return classList.some(className => className.endsWith('-comment'));
        });
      }

      if (commentElements.length > 0) {
        console.log(`Found ${commentElements.length} comment element(s)`);

        // Add badge to each comment element at the beginning
        commentElements.forEach(commentElement => {
          // Ensure comment element has position relative for absolute positioning of badge
          const computedStyle = window.getComputedStyle(commentElement);
          if (computedStyle.position === 'static') {
            commentElement.style.position = 'relative';
          }

          const badge = createBadgeElement(
            commentElement,
            strings.modal.badgeTitle,
            () => this.openReportModal()
          );

          // Position badge in top right corner of comment
          badge.style.position = 'absolute';
          badge.style.top = '0';
          badge.style.right = '0';
          badge.style.marginLeft = '0';
          badge.style.zIndex = '10';

          // Insert badge at the beginning of the comment element
          commentElement.insertBefore(badge, commentElement.firstChild);
        });

        return commentElements.length;
      } else {
        console.log('No comment elements found');
      }
    } catch (error) {
      console.error('Error initializing badges on comments:', error);
    }
    return 0;
  },

  /**
   * Initialize badge on footer
   * Adds badge in the bottom right corner of the viewport, inserted before closing </body> tag
   */
  async initBadgesOnFooter() {
    try {
      const badge = createBadgeElement(
        document.body,
        strings.modal.badgeTitle,
        () => this.openReportModal()
      );

      // Position badge in bottom right corner of viewport
      badge.style.position = 'fixed';
      badge.style.bottom = '15px';
      badge.style.right = '15px';
      badge.style.marginLeft = '0';
      badge.style.zIndex = '10';

      // Insert badge before closing </body> tag (as last element in body)
      document.body.appendChild(badge);

      console.log('Badge added to footer (before closing </body> tag)');
    } catch (error) {
      console.error('Error initializing badge on footer:', error);
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

    // Replace about text
    result = result.replace(/\{\{ABOUT\}\}/g, strings.modal.about);

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
        modalDialog.className = 'api-notiotrack-modal';

        // Copy content from template (without the dialog tag itself)
        const dialogContent = templateDialog.innerHTML;
        modalDialog.innerHTML = dialogContent;

        // Ensure dialog is centered in viewport regardless of scroll position
        modalDialog.style.position = 'fixed';
        modalDialog.style.top = '50%';
        modalDialog.style.left = '50%';
        modalDialog.style.transform = 'translate(-50%, -50%)';
        modalDialog.style.margin = '0';

        // Add styles to document if not already present
        if (styles && !document.getElementById('api-notiotrack-modal-styles')) {
          const styleElement = document.createElement('style');
          styleElement.id = 'api-notiotrack-modal-styles';
          styleElement.textContent = styles.textContent;
          document.head.appendChild(styleElement);
        }

        // Add close button functionality (X button)
        const closeButton = modalDialog.querySelector('.modal-close-button');
        if (closeButton) {
          // Remove focus from close button to prevent outline
          closeButton.blur();
          closeButton.addEventListener('click', () => {
            modalDialog.close();
          });
        }

        // Add submit button functionality
        const submitButton = modalDialog.querySelector('.submit-button');
        if (submitButton) {
          submitButton.addEventListener('click', () => {
            modalDialog.close();
          });
        }

        // Add to document
        document.body.appendChild(modalDialog);
      }
    }

    // Open the modal
    if (modalDialog) {
      // Save scroll position before opening modal (showModal() may cause scroll to top)
      const savedScrollY = window.scrollY || document.documentElement.scrollTop;
      const savedScrollX = window.scrollX || document.documentElement.scrollLeft;

      modalDialog.showModal();

      // Restore scroll position immediately using instant behavior
      // Try multiple methods to ensure scroll is restored
      const restoreScroll = () => {
        window.scrollTo({ top: savedScrollY, left: savedScrollX, behavior: 'instant' });
        document.documentElement.scrollTop = savedScrollY;
        document.documentElement.scrollLeft = savedScrollX;
        document.body.scrollTop = savedScrollY;
        document.body.scrollLeft = savedScrollX;
      };

      // Restore immediately
      restoreScroll();

      // Also restore asynchronously in case browser delays the scroll
      requestAnimationFrame(() => {
        restoreScroll();
        requestAnimationFrame(() => {
          restoreScroll();
        });
      });

      // Remove focus from close button if it has focus
      const closeButton = modalDialog.querySelector('.modal-close-button');
      if (closeButton && document.activeElement === closeButton) {
        closeButton.blur();
      }
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
      ApiNotioTrack.initBadges();
    });
  } else {
    // DOM is already ready
    ApiNotioTrack.initBadges();
  }
}

// Export for bundling
export default ApiNotioTrack;
