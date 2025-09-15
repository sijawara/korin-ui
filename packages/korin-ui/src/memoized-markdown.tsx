import { cn } from "@monorepo/shadcn-ui/libs/utils";
import { CodeBlock, CodeBlockCopyButton } from "@monorepo/ui/code-block-with-copy";
import "katex/dist/katex.min.css";
import { marked } from "marked";
import React, { memo, useId, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface MemoizedMarkdownProps {
  content: string;
  className?: string;
  onHyperlinkClicked?: React.MouseEventHandler<HTMLAnchorElement>;
  components?: Partial<Components>;
}

// Regular functions at module level (not hooks)
export function processKatexInMarkdown(markdown: string) {
  return markdown
    .replace(/\\\\\[/g, "$$$$") // Replace '\\[' with '$$'
    .replace(/\\\\\]/g, "$$$$") // Replace '\\]' with '$$'
    .replace(/\\\\\(/g, "$$$$") // Replace '\\(' with '$$'
    .replace(/\\\\\)/g, "$$$$") // Replace '\\)' with '$$'
    .replace(/\\\[/g, "$$$$") // Replace '\[' with '$$'
    .replace(/\\\]/g, "$$$$") // Replace '\]' with '$$'
    .replace(/\\\(/g, "$$$$") // Replace '\(' with '$$'
    .replace(/\\\)/g, "$$$$"); // Replace '\)' with '$$';
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

function extractLanguage(className?: string): string {
  if (!className) return "plaintext";
  const match = className.match(/language-(\w+)/);
  return match && match[1] ? match[1] : "plaintext";
}

const INITIAL_COMPONENTS: Partial<Components> = {
  code: memo(function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line || props.node?.position?.start.line === props.node?.position?.end.line;

    const language = useMemo(() => extractLanguage(className), [className]);
    const code = useMemo(() => String(children).replace(/\n$/, ""), [children]);

    if (isInline) {
      return (
        <span className={cn("bg-primary-foreground rounded-sm px-1 font-mono text-sm", className)} {...props}>
          {children}
        </span>
      );
    }

    return (
      <CodeBlock code={code} language={language}>
        <CodeBlockCopyButton />
      </CodeBlock>
    );
  }),
  table: memo(function TableComponent({ children, className, ...props }) {
    return (
      <div className="my-6 w-full overflow-y-auto">
        <table className={cn("w-full", className)} {...props}>
          {children}
        </table>
      </div>
    );
  }),
  thead: memo(function TheadComponent({ children, className, ...props }) {
    return (
      <thead className={className} {...props}>
        {children}
      </thead>
    );
  }),
  tbody: memo(function TbodyComponent({ children, className, ...props }) {
    return (
      <tbody className={className} {...props}>
        {children}
      </tbody>
    );
  }),
  tr: memo(function TrComponent({ children, className, ...props }) {
    return (
      <tr className={cn("even:bg-muted m-0 border-t p-0", className)} {...props}>
        {children}
      </tr>
    );
  }),
  th: memo(function ThComponent({ children, className, ...props }) {
    return (
      <th
        className={cn(
          "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
          className,
        )}
        {...props}
      >
        {children}
      </th>
    );
  }),
  td: memo(function TdComponent({ children, className, ...props }) {
    return (
      <td
        className={cn(
          "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
          className,
        )}
        {...props}
      >
        {children}
      </td>
    );
  }),
  a: memo(function AComponent({ href, children, className, ...props }) {
    if (!href) return <span {...props}>{children}</span>;

    return (
      <a
        className={cn("text-primary hover:text-primary/80 underline underline-offset-4", className)}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }),
  pre: memo(function PreComponent({ children }) {
    return <>{children}</>;
  }),
  p: memo(function PComponent({ className, children, ...props }) {
    return (
      <p className={cn("text-inherit", className)} {...props}>
        {children}
      </p>
    );
  }),
};

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components = INITIAL_COMPONENTS,
  }: {
    content: string;
    components?: Partial<Components>;
  }) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, [remarkMath, { singleDollarTextMath: false }]]}
        rehypePlugins={[() => rehypeKatex({ output: "htmlAndMathml" })]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    );
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content && prevProps.components === nextProps.components;
  },
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

function SimpleMemoizedMarkdownComponent({
  content,
  className,
  onHyperlinkClicked,
  components = INITIAL_COMPONENTS,
}: MemoizedMarkdownProps) {
  const generatedId = useId();

  // Memoize the processed content
  const processedContent = useMemo(() => processKatexInMarkdown(content), [content]);

  // Memoize the parsed blocks
  const blocks = useMemo(() => parseMarkdownIntoBlocks(processedContent), [processedContent]);

  // Memoize the anchor component with click handler
  const anchorComponentWithClick = useMemo(() => {
    if (!onHyperlinkClicked) return undefined;

    return memo(function AComponentWithClick({
      href,
      children,
      className,
      ...props
    }: {
      href?: string;
      children?: React.ReactNode;
      className?: string;
      [key: string]: any;
    }) {
      if (!href) return <span {...props}>{children}</span>;

      return (
        <a
          className={cn("text-primary hover:text-primary/80 underline underline-offset-4", className)}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onHyperlinkClicked}
          {...props}
        >
          {children}
        </a>
      );
    });
  }, [onHyperlinkClicked]);

  // Memoize merged components more efficiently
  const mergedComponents = useMemo(() => {
    const baseComponents = { ...INITIAL_COMPONENTS, ...components };

    if (anchorComponentWithClick) {
      baseComponents.a = anchorComponentWithClick;
    }

    return baseComponents;
  }, [components, anchorComponentWithClick]);

  // Memoize the className computation
  const containerClassName = useMemo(
    () =>
      cn(
        "prose dark:prose-invert prose-p:text-inherit prose-headings:text-inherit prose-li:text-inherit prose-strong:text-inherit prose-em:text-inherit max-w-none",
        className,
      ),
    [className],
  );

  return (
    <div className={containerClassName}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock key={`${generatedId}-block-${index}`} content={block} components={mergedComponents} />
      ))}
    </div>
  );
}

export const SimpleMemoizedMarkdown = memo(
  SimpleMemoizedMarkdownComponent,
  function propsAreEqual(prevProps, nextProps) {
    return (
      prevProps.content === nextProps.content &&
      prevProps.className === nextProps.className &&
      prevProps.onHyperlinkClicked === nextProps.onHyperlinkClicked &&
      prevProps.components === nextProps.components
    );
  },
);

export const MemoizedMarkdown = SimpleMemoizedMarkdown;
