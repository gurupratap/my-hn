/**
 * Tests for HTML Sanitization Module
 *
 * Validates that sanitizeHtml properly removes dangerous content
 * while preserving safe HTML elements.
 */

import { sanitizeHtml } from '../../lib/sanitize';

describe('sanitizeHtml', () => {
  describe('removes script tags', () => {
    it('removes inline script tags', () => {
      const html = '<script>alert("xss")</script><p>Hello</p>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>Hello</p>');
    });

    it('removes script tags with src attribute', () => {
      const html = '<script src="https://evil.com/hack.js"></script><p>Safe</p>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('<script');
      expect(result).not.toContain('evil.com');
      expect(result).toContain('<p>Safe</p>');
    });

    it('removes script tags with type attribute', () => {
      const html = '<script type="text/javascript">document.cookie</script>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('<script');
      expect(result).not.toContain('document.cookie');
    });
  });

  describe('removes onclick and other event handlers', () => {
    it('removes onclick handlers', () => {
      const html = '<a href="#" onclick="alert(1)">Click me</a>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
      expect(result).toContain('Click me');
    });

    it('removes onerror handlers', () => {
      const html = '<img src="x" onerror="alert(1)">';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    it('removes onload handlers', () => {
      const html = '<body onload="alert(1)"><p>Content</p></body>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('onload');
      expect(result).not.toContain('alert');
    });

    it('removes onmouseover handlers', () => {
      const html = '<div onmouseover="alert(1)">Hover me</div>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('onmouseover');
      expect(result).not.toContain('alert');
    });

    it('removes onfocus handlers', () => {
      const html = '<input onfocus="alert(1)">';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('onfocus');
      expect(result).not.toContain('alert');
    });
  });

  describe('preserves safe HTML', () => {
    it('preserves p tags', () => {
      const html = '<p>This is a paragraph</p>';
      const result = sanitizeHtml(html);

      expect(result).toBe('<p>This is a paragraph</p>');
    });

    it('preserves a tags with href', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeHtml(html);

      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('Link');
    });

    it('preserves code tags', () => {
      const html = '<code>const x = 1;</code>';
      const result = sanitizeHtml(html);

      expect(result).toBe('<code>const x = 1;</code>');
    });

    it('preserves pre tags', () => {
      const html = '<pre>function hello() {}</pre>';
      const result = sanitizeHtml(html);

      expect(result).toBe('<pre>function hello() {}</pre>');
    });

    it('preserves em and strong tags', () => {
      const html = '<em>emphasized</em> and <strong>bold</strong>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<em>emphasized</em>');
      expect(result).toContain('<strong>bold</strong>');
    });

    it('preserves br tags', () => {
      const html = 'Line 1<br>Line 2';
      const result = sanitizeHtml(html);

      expect(result).toContain('<br>');
    });

    it('preserves lists (ul, ol, li)', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = sanitizeHtml(html);

      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item 1</li>');
      expect(result).toContain('<li>Item 2</li>');
      expect(result).toContain('</ul>');
    });

    it('preserves blockquote tags', () => {
      const html = '<blockquote>A quote</blockquote>';
      const result = sanitizeHtml(html);

      expect(result).toBe('<blockquote>A quote</blockquote>');
    });

    it('preserves nested safe tags', () => {
      const html = '<p><strong><em>Bold and italic</em></strong></p>';
      const result = sanitizeHtml(html);

      expect(result).toBe('<p><strong><em>Bold and italic</em></strong></p>');
    });
  });

  describe('handles XSS payloads', () => {
    it('removes javascript: URLs', () => {
      const html = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('javascript:');
    });

    it('removes data: URLs with script', () => {
      const html = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('data:');
      expect(result).not.toContain('<script>');
    });

    it('removes iframe tags', () => {
      const html = '<iframe src="https://evil.com"></iframe><p>Safe</p>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('<iframe');
      expect(result).toContain('<p>Safe</p>');
    });

    it('removes object tags', () => {
      const html = '<object data="evil.swf"></object>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('<object');
    });

    it('removes embed tags', () => {
      const html = '<embed src="evil.swf">';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('<embed');
    });

    it('removes style tags', () => {
      const html = '<style>body { display: none; }</style><p>Hello</p>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('<style');
      expect(result).toContain('<p>Hello</p>');
    });

    it('removes form tags', () => {
      const html = '<form action="https://evil.com"><input></form>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('<form');
      expect(result).not.toContain('<input');
    });

    it('handles mixed case XSS attempts', () => {
      const html = '<ScRiPt>alert(1)</sCrIpT>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('script');
      expect(result).not.toContain('Script');
      expect(result).not.toContain('alert');
    });

    it('handles encoded XSS attempts', () => {
      const html = '<a href="&#106;avascript:alert(1)">Click</a>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('javascript');
      expect(result).not.toContain('alert');
    });

    it('handles SVG-based XSS', () => {
      const html = '<svg onload="alert(1)"><circle></circle></svg>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('<svg');
      expect(result).not.toContain('onload');
    });

    it('handles img-based XSS', () => {
      const html = '<img src=x onerror=alert(1)>';
      const result = sanitizeHtml(html);

      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });
  });

  describe('adds security attributes to links', () => {
    it('adds target="_blank" to links', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeHtml(html);

      expect(result).toContain('target="_blank"');
    });

    it('adds rel="noopener noreferrer" to links', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeHtml(html);

      expect(result).toContain('rel="noopener noreferrer"');
    });
  });

  describe('handles edge cases', () => {
    it('returns empty string for null input', () => {
      const result = sanitizeHtml(null as unknown as string);

      expect(result).toBe('');
    });

    it('returns empty string for undefined input', () => {
      const result = sanitizeHtml(undefined as unknown as string);

      expect(result).toBe('');
    });

    it('returns empty string for empty string input', () => {
      const result = sanitizeHtml('');

      expect(result).toBe('');
    });

    it('handles plain text without HTML', () => {
      const result = sanitizeHtml('Just plain text');

      expect(result).toBe('Just plain text');
    });

    it('handles HTML entities', () => {
      const result = sanitizeHtml('&lt;script&gt;');

      expect(result).toBe('&lt;script&gt;');
    });
  });
});
