/**
 * Main entry point for ApiNotioTrack library
 * All dependencies should be imported here and will be bundled into script.js
 */

import { Readability } from '@mozilla/readability';

/**
 * Main library object
 */
const ApiNotioTrack = {
  /**
   * Initialize the library
   */
  init() {
    console.log('ApiNotioTrack initialized');
  },

  /**
   * Extract article title using Readability
   */
  extractArticleTitle() {
    try {
      // Clone document to avoid modifying the original
      const documentClone = document.cloneNode(true);
      const reader = new Readability(documentClone);
      const article = reader.parse();

      if (article && article.title) {
        console.log('Article title:', article.title);
        return article.title;
      } else {
        console.log('No article title found');
        return null;
      }
    } catch (error) {
      console.error('Error extracting article title:', error);
      return null;
    }
  }
};

// Auto-extract article title when script is loaded
if (typeof document !== 'undefined') {
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
