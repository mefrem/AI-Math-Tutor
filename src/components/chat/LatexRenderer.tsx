/**
 * LaTeX Renderer Component
 * Renders text with inline and block LaTeX math using KaTeX
 */

'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export function LatexRenderer({ content, className = '' }: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Replace inline LaTeX \(...\) with rendered math
    // Replace block LaTeX \[...\] with rendered math
    let processed = content;

    // Process block math first \[...\]
    // Use [\s\S] instead of . with 's' flag for ES5 compatibility
    processed = processed.replace(
      /\\\[([\s\S]*?)\\\]/g,
      (match, latex) => {
        try {
          return `<div class="katex-block">${katex.renderToString(latex, {
            displayMode: true,
            throwOnError: false,
          })}</div>`;
        } catch (e) {
          return match;
        }
      }
    );

    // Process inline math \(...\)
    processed = processed.replace(
      /\\\((.*?)\\\)/g,
      (match, latex) => {
        try {
          return katex.renderToString(latex, {
            displayMode: false,
            throwOnError: false,
          });
        } catch (e) {
          return match;
        }
      }
    );

    // Set HTML
    containerRef.current.innerHTML = processed;
  }, [content]);

  return <div ref={containerRef} className={className} />;
}
