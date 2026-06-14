import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="font-heading text-3xl text-wood mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-heading text-2xl text-copper mt-6 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-heading text-xl text-wood mt-4 mb-2">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-wood/80 leading-relaxed mb-4">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-wood/80 mb-4 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-wood/80 mb-4 space-y-1">{children}</ol>
    ),
    a: ({ href, children }) => (
      <a href={href} className="text-neon underline decoration-copper/30 hover:decoration-copper transition-all">
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-copper pl-4 italic text-wood/70 my-4">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-wood/5 text-tech px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-wood/5 p-4 rounded overflow-x-auto mb-4 text-sm font-mono">
        {children}
      </pre>
    ),
    ...components,
  };
}
