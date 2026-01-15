/**
 * Tests for HTML Sanitization Module
 *
 * Validates that parseAndSanitize properly parses markdown and
 * removes dangerous content while preserving safe HTML elements.
 */

import { parseAndSanitize } from '../../lib/sanitize';

describe('parseAndSanitize', () => {
  describe('parses markdown', () => {
    it('converts *text* to italics', () => {
      const result = parseAndSanitize('*italics*');

      expect(result).toContain('<em>italics</em>');
    });

    it('converts **text** to bold', () => {
      const result = parseAndSanitize('**bold**');

      expect(result).toContain('<strong>bold</strong>');
    });

    it('converts [link](url) to anchor tag', () => {
      const result = parseAndSanitize('[Link](https://example.com)');

      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('Link');
    });

    it('converts `code` to code tag', () => {
      const result = parseAndSanitize('`const x = 1`');

      expect(result).toContain('<code>const x = 1</code>');
    });

    it('converts code blocks to pre tags', () => {
      const result = parseAndSanitize('```\nfunction hello() {}\n```');

      expect(result).toContain('<pre>');
      expect(result).toContain('function hello() {}');
    });
  });

  describe('removes script tags', () => {
    it('removes inline script tags', () => {
      const text = '<script>alert("xss")</script>Hello';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('Hello');
    });

    it('removes script tags with src attribute', () => {
      const text = '<script src="https://evil.com/hack.js"></script>Safe';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('<script');
      expect(result).not.toContain('evil.com');
      expect(result).toContain('Safe');
    });

    it('removes script tags with type attribute', () => {
      const text = '<script type="text/javascript">document.cookie</script>';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('<script');
      expect(result).not.toContain('document.cookie');
    });
  });

  describe('removes onclick and other event handlers', () => {
    it('removes onclick handlers', () => {
      const text = '<a href="#" onclick="alert(1)">Click me</a>';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
      expect(result).toContain('Click me');
    });

    it('removes onerror handlers', () => {
      const text = '<img src="x" onerror="alert(1)">';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    it('removes onload handlers', () => {
      const text = '<body onload="alert(1)">Content</body>';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('onload');
      expect(result).not.toContain('alert');
    });

    it('removes onmouseover handlers', () => {
      const text = '<div onmouseover="alert(1)">Hover me</div>';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('onmouseover');
      expect(result).not.toContain('alert');
    });

    it('removes onfocus handlers', () => {
      const text = '<input onfocus="alert(1)">';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('onfocus');
      expect(result).not.toContain('alert');
    });
  });

  describe('preserves safe HTML', () => {
    it('preserves p tags', () => {
      const text = '<p>This is a paragraph</p>';
      const result = parseAndSanitize(text);

      expect(result).toContain('<p>This is a paragraph</p>');
    });

    it('preserves a tags with href', () => {
      const text = '<a href="https://example.com">Link</a>';
      const result = parseAndSanitize(text);

      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('Link');
    });

    it('preserves code tags', () => {
      const text = '<code>const x = 1;</code>';
      const result = parseAndSanitize(text);

      expect(result).toContain('<code>const x = 1;</code>');
    });

    it('preserves pre tags', () => {
      const text = '<pre>function hello() {}</pre>';
      const result = parseAndSanitize(text);

      expect(result).toContain('<pre>function hello() {}</pre>');
    });

    it('preserves em and strong tags', () => {
      const text = '<em>emphasized</em> and <strong>bold</strong>';
      const result = parseAndSanitize(text);

      expect(result).toContain('<em>emphasized</em>');
      expect(result).toContain('<strong>bold</strong>');
    });

    it('preserves br tags', () => {
      const text = 'Line 1<br>Line 2';
      const result = parseAndSanitize(text);

      expect(result).toContain('<br>');
    });

    it('preserves lists (ul, ol, li)', () => {
      const text = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = parseAndSanitize(text);

      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item 1</li>');
      expect(result).toContain('<li>Item 2</li>');
      expect(result).toContain('</ul>');
    });

    it('preserves blockquote tags', () => {
      const text = '<blockquote>A quote</blockquote>';
      const result = parseAndSanitize(text);

      expect(result).toContain('<blockquote>');
      expect(result).toContain('A quote');
    });

    it('preserves nested safe tags', () => {
      const text = '<p><strong><em>Bold and italic</em></strong></p>';
      const result = parseAndSanitize(text);

      expect(result).toContain('<strong><em>Bold and italic</em></strong>');
    });
  });

  describe('handles XSS payloads', () => {
    it('removes javascript: URLs', () => {
      const text = '<a href="javascript:alert(1)">Click</a>';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('javascript:');
    });

    it('removes data: URLs with script', () => {
      const text = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('data:');
      expect(result).not.toContain('<script>');
    });

    it('removes iframe tags', () => {
      const text = '<iframe src="https://evil.com"></iframe>Safe';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('<iframe');
      expect(result).toContain('Safe');
    });

    it('removes object tags', () => {
      const text = '<object data="evil.swf"></object>';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('<object');
    });

    it('removes embed tags', () => {
      const text = '<embed src="evil.swf">';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('<embed');
    });

    it('removes style tags', () => {
      const text = '<style>body { display: none; }</style>Hello';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('<style');
      expect(result).toContain('Hello');
    });

    it('removes form tags', () => {
      const text = '<form action="https://evil.com"><input></form>';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('<form');
      expect(result).not.toContain('<input');
    });

    it('handles mixed case XSS attempts', () => {
      const text = '<ScRiPt>alert(1)</sCrIpT>';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('script');
      expect(result).not.toContain('Script');
      expect(result).not.toContain('alert');
    });

    it('handles encoded XSS attempts', () => {
      const text = '<a href="&#106;avascript:alert(1)">Click</a>';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('javascript');
      expect(result).not.toContain('alert');
    });

    it('handles SVG-based XSS', () => {
      const text = '<svg onload="alert(1)"><circle></circle></svg>';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('<svg');
      expect(result).not.toContain('onload');
    });

    it('handles img-based XSS', () => {
      const text = '<img src=x onerror=alert(1)>';
      const result = parseAndSanitize(text);

      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });
  });

  describe('adds security attributes to links', () => {
    it('adds target="_blank" to links', () => {
      const text = '<a href="https://example.com">Link</a>';
      const result = parseAndSanitize(text);

      expect(result).toContain('target="_blank"');
    });

    it('adds rel="noopener noreferrer" to links', () => {
      const text = '<a href="https://example.com">Link</a>';
      const result = parseAndSanitize(text);

      expect(result).toContain('rel="noopener noreferrer"');
    });
  });

  describe('handles edge cases', () => {
    it('returns empty string for null input', () => {
      const result = parseAndSanitize(null as unknown as string);

      expect(result).toBe('');
    });

    it('returns empty string for undefined input', () => {
      const result = parseAndSanitize(undefined as unknown as string);

      expect(result).toBe('');
    });

    it('returns empty string for empty string input', () => {
      const result = parseAndSanitize('');

      expect(result).toBe('');
    });

    it('handles plain text without HTML', () => {
      const result = parseAndSanitize('Just plain text');

      expect(result).toContain('Just plain text');
    });

    it('handles HTML entities', () => {
      const result = parseAndSanitize('&lt;script&gt;');

      expect(result).toContain('&lt;script&gt;');
    });
  });
});
