import iconSvg from '../icon.svg';

/**
 * Create badge element (span with SVG icon) that can be appended to any element
 * @param {HTMLElement} targetElement - Element to which badge will be appended (used for font size calculation)
 * @param {string} badgeTitle - Title text for the badge tooltip
 * @param {Function} onBadgeClick - Callback function to execute when badge is clicked
 * @returns {HTMLElement} Badge element ready to be appended
 */
export function createBadgeElement(targetElement, badgeTitle, onBadgeClick) {
  const badge = document.createElement('span');
  badge.style.display = 'inline-block';
  badge.style.verticalAlign = 'super';
  badge.style.marginLeft = '0.5em';

  // Get font size from target element (or use default)
  const targetFontSize = window.getComputedStyle(targetElement).fontSize;
  const fontSizeValue = parseFloat(targetFontSize) || 16;
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
  badge.setAttribute('title', badgeTitle);
  badge.setAttribute('data-api-notiotrack-badge', 'true'); // Mark badge for easy finding
  
  const badgeClickHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onBadgeClick();
  };
  
  badge.addEventListener('click', badgeClickHandler);
  
  // Also add click handler to SVG to prevent propagation from SVG element
  if (svgElement) {
    svgElement.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      badgeClickHandler(event);
    });
  }

  return badge;
}
