/**
 * HTML Sanitization Module
 *
 * Provides secure HTML sanitization using sanitize-html to prevent XSS attacks.
 * Used primarily for rendering user-generated content like comments.
 *
 * Security features:
 * - Removes all script tags and content
 * - Strips event handlers (onclick, onerror, etc.)
 * - Removes dangerous attributes (javascript: URLs)
 * - Preserves safe HTML elements (p, a, code, pre, em, strong, etc.)
 */

import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';

/**
 * sanitize-html configuration for safe HTML rendering
 * Only allows a whitelist of safe tags and attributes
 */
const SANITIZE_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
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
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    // Add rel="noopener noreferrer" and target="_blank" to all links
    // for security (prevents tabnabbing attacks)
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
  },
};

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
  return sanitizeHtml(html, SANITIZE_CONFIG);
}
