import * as React from 'react';
import type { MessageFormatter, ReceivedChatMessage } from '@livekit/components-react';
import { parseMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import { useChatMessage } from './hooks/utils';

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
          'prose prose-sm dark:prose-invert max-w-4/5 rounded-[20px] p-2 text-sm',
          '[&_code]:bg-bg3 [&_code]:rounded [&_code]:px-1 [&_em]:italic [&_strong]:font-semibold',
          '[&_li]:my-0.5 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4',
          '[&_a]:text-primary [&_a]:underline',
          isUser ? 'bg-bg3 ml-auto' : 'mr-auto'
        )}
        dangerouslySetInnerHTML={!isUser ? { __html: parseMarkdown(String(message)) } : undefined}
      >
        {isUser ? message : null}
      </span>
    </li>
  );
};
