import * as React from 'react';
import type { MessageFormatter, ReceivedChatMessage } from '@livekit/components-react';
import { cn } from '@/lib/utils';
import { useChatMessage } from './hooks/utils';

// Convertir le markdown basique en HTML
function formatMarkdown(text: string): string {
  if (!text) return '';

  let html = text
    // Escape HTML pour éviter XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Titres ### (h3), ## (h2), # (h1)
  html = html
    .replace(/^### (.+)$/gm, '<h3 class="font-bold text-base mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold text-lg mt-3 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-bold text-xl mt-3 mb-1">$1</h1>');

  // Gras **text** ou __text__
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italique *text* ou _text_
  html = html
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');

  // Code inline `code`
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm">$1</code>');

  // Listes à puces (- item ou * item au début de ligne)
  html = html
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>');

  // Retours à la ligne
  html = html.replace(/\n/g, '<br>');

  // Envelopper les <li> dans <ul>
  if (html.includes('<li>')) {
    html = html
      .replace(/<br><li>/g, '<li>')
      .replace(/<\/li><br>/g, '</li>')
      .replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul class="list-disc pl-4 my-1">$&</ul>');
  }

  // Nettoyer les <br> après les titres
  html = html
    .replace(/<\/h1><br>/g, '</h1>')
    .replace(/<\/h2><br>/g, '</h2>')
    .replace(/<\/h3><br>/g, '</h3>')
    .replace(/<br><h/g, '<h');

  return html;
}

export interface ChatEntryProps extends React.HTMLAttributes<HTMLLIElement> {
  /** The chat massage object to display. */
  entry: ReceivedChatMessage;
  /** Hide sender name. Useful when displaying multiple consecutive chat messages from the same person. */
  hideName?: boolean;
  /** Hide message timestamp. */
  hideTimestamp?: boolean;
  /** An optional formatter for the message body. */
  messageFormatter?: MessageFormatter;
}

export const ChatEntry = ({
  entry,
  messageFormatter,
  hideName,
  hideTimestamp,
  className,
  ...props
}: ChatEntryProps) => {
  const { message, hasBeenEdited, time, locale, name } = useChatMessage(entry, messageFormatter);

  const isUser = entry.from?.isLocal ?? false;
  const messageOrigin = isUser ? 'remote' : 'local';

  return (
    <li
      data-lk-message-origin={messageOrigin}
      title={time.toLocaleTimeString(locale, { timeStyle: 'full' })}
      className={cn('group flex flex-col gap-0.5', className)}
      {...props}
    >
      {(!hideTimestamp || !hideName || hasBeenEdited) && (
        <span className="text-muted-foreground flex text-sm">
          {!hideName && <strong className="mt-2">{name}</strong>}

          {!hideTimestamp && (
            <span className="align-self-end ml-auto font-mono text-xs opacity-0 transition-opacity ease-linear group-hover:opacity-100">
              {hasBeenEdited && '*'}
              {time.toLocaleTimeString(locale, { timeStyle: 'short' })}
            </span>
          )}
        </span>
      )}

      <span
        className={cn(
          'max-w-4/5 rounded-[20px] px-4 py-3 text-sm',
          isUser ? 'bg-bg3 ml-auto' : 'mr-auto'
        )}
        dangerouslySetInnerHTML={{
          __html: formatMarkdown(String(message ?? '')),
        }}
      />
    </li>
  );
};
