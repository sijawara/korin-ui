import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MemoizedMarkdownProps {
  content: string;
  className?: string;
}

/**
 * MemoizedMarkdown component that renders markdown content 
 * and only re-renders when the content or className changes
 */
const MemoizedMarkdownComponent = ({ content, className }: MemoizedMarkdownProps) => {
  return (
    <div className={cn('prose dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return (
              <code
                className={cn(
                  'rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
                  match && 'p-0'
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ className, children, ...props }) => {
            return (
              <pre
                className={cn(
                  'mb-4 mt-4 overflow-x-auto rounded-lg border bg-black p-4',
                  className
                )}
                {...props}
              >
                {children}
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const MemoizedMarkdown = memo(MemoizedMarkdownComponent); 