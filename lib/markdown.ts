/**
 * Lightweight Markdown parser for chat messages
 * Supports: bold, italic, code, links, lists, line breaks
 */

export function parseMarkdown(text: string): string {
  if (!text) return '';

  let html = text
    // Escape HTML to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

    // Code blocks (```)
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')

    // Inline code (`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')

    // Bold (**text** or __text__)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')

    // Italic (*text* or _text_)
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/(?<![a-zA-Z0-9])_([^_]+)_(?![a-zA-Z0-9])/g, '<em>$1</em>')

    // Links [text](url)
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )

    // Unordered lists (- item or * item)
    .replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>')

    // Ordered lists (1. item)
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')

    // Line breaks
    .replace(/\n/g, '<br />');

  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/(<li>.*?<\/li>)(<br \/>)?/g, '$1');
  html = html.replace(/((?:<li>.*?<\/li>)+)/g, '<ul>$1</ul>');

  return html;
}
