import DOMPurify from 'dompurify';

/**
 * Safely highlights search terms in text while preventing XSS attacks
 * @param text - The text to highlight
 * @param searchTerm - The term to highlight
 * @returns Sanitized HTML string with highlighted terms
 */
export function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm || !text) {
    return DOMPurify.sanitize(text);
  }
  
  // Escape special regex characters in search term
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  
  // Replace matches with highlighted version
  const highlightedText = text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  
  // Sanitize the HTML to prevent XSS
  return DOMPurify.sanitize(highlightedText, {
    ALLOWED_TAGS: ['mark'],
    ALLOWED_ATTR: ['class']
  });
}

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Clean and validate text input
 * @param text - Input text
 * @returns Cleaned text
 */
export function sanitizeInput(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}