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
import { marked } from 'marked';

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
 * Parse markdown to HTML and then sanitize it to prevent XSS attacks
 *
 * @param text - The text that may contain markdown formatting or HTML
 * @returns Sanitized HTML string safe for rendering with dangerouslySetInnerHTML
 *
 * @example
 * ```ts
 * const userContent = '*bold* and <script>alert("xss")</script>';
 * const safe = parseAndSanitize(userContent);
 * // Returns: '<p><em>bold</em> and </p>'
 * ```
 */
export function parseAndSanitize(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const html = marked.parse(text, { async: false }) as string;
  return DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
}
