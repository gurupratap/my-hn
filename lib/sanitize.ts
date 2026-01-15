/**
 * HTML Sanitization Module
 *
 * Provides secure HTML sanitization using DOMPurify to prevent XSS attacks.
 * Used primarily for rendering user-generated content like comments.
 *
 * Security features:
 * - Removes all script tags and content
 * - Strips event handlers (onclick, onerror, etc.)
 * - Removes dangerous attributes (javascript: URLs)
 * - Preserves safe HTML elements (p, a, code, pre, em, strong, etc.)
 */

import DOMPurify, { type Config } from 'isomorphic-dompurify';

/**
 * DOMPurify configuration for safe HTML rendering
 * Only allows a whitelist of safe tags and attributes
 */
const DOMPURIFY_CONFIG: Config = {
  ALLOWED_TAGS: [
    'a',
    'b',
    'blockquote',
    'br',
    'code',
    'em',
    'i',
    'li',
    'ol',
    'p',
    'pre',
    'strong',
    'ul',
  ],
  ALLOWED_ATTR: ['href', 'rel', 'target'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target', 'rel'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'object', 'embed'],
  FORBID_ATTR: [
    'onerror',
    'onclick',
    'onload',
    'onmouseover',
    'onfocus',
    'onblur',
    'onchange',
    'onsubmit',
  ],
};

/**
 * Hook to add rel="noopener noreferrer" and target="_blank" to all links
 * for security (prevents tabnabbing attacks)
 */
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering with dangerouslySetInnerHTML
 *
 * @example
 * ```ts
 * const userContent = '<script>alert("xss")</script><p>Hello</p>';
 * const safe = sanitizeHtml(userContent);
 * // Returns: '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
}
