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
    .replace(/>/g, '&gt;')
    // Gras **text** ou __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Listes à puces (- item ou * item)
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    // Retours à la ligne
    .replace(/\n/g, '<br>');

  // Envelopper les <li> dans <ul>
  if (html.includes('<li>')) {
    // Remplacer les séquences de <li> par <ul>...</ul>
    html = html
      .replace(/<br><li>/g, '<li>')
      .replace(/<\/li><br>/g, '</li>')
      .replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul class="list-disc pl-4 my-1">$&</ul>');
  }

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
          'max-w-4/5 rounded-[20px] p-2 text-sm',
          isUser ? 'bg-bg3 ml-auto' : 'mr-auto'
        )}
        dangerouslySetInnerHTML={{
          __html: formatMarkdown(String(message ?? '')),
        }}
      />
    </li>
  );
};
