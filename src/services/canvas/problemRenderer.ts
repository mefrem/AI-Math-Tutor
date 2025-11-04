/**
 * Problem Renderer Service
 * Converts problem text to KaTeX-rendered images for Konva canvas
 * Note: This service uses browser-only libraries (katex, html2canvas)
 * and should only be called from client components.
 */

import type { MathProblem } from "@/types/models";
import type { Position, Dimensions } from "@/types/models";

/**
 * Processed problem segment
 */
interface ProblemSegment {
  type: "text" | "math";
  content: string;
  latex?: string; // LaTeX for math segments
}

/**
 * Rendered problem element
 */
export interface RenderedElement {
  type: "text" | "image";
  content: string; // Text content or image data URL
  position: Position;
  size: Dimensions;
  semanticId?: string; // Semantic ID for registration
}

/**
 * Convert plain text math notation to LaTeX
 */
function convertToLaTeX(text: string): string {
  let latex = text;

  // Convert fractions: "3/4" → "\frac{3}{4}"
  // Match fractions like "3/4", "3/4 + 1/2", etc.
  latex = latex.replace(/(\d+)\/(\d+)/g, (match, num, den) => {
    return `\\frac{${num}}{${den}}`;
  });

  // Convert exponents: "x^2" → "x^{2}", "x²" → "x^{2}"
  // Handle x^2, x², 3x^2, etc.
  latex = latex.replace(
    /([a-zA-Z0-9]+)\^(\d+)/g,
    (match, base, exp) => `${base}^{${exp}}`
  );
  // Handle superscript characters (², ³, etc.) - Unicode escapes
  latex = latex.replace(/\u00B2/g, "^{2}"); // ²
  latex = latex.replace(/\u00B3/g, "^{3}"); // ³

  // Convert square roots: "√16" → "\sqrt{16}" or "sqrt(16)" → "\sqrt{16}"
  // Use Unicode escape for square root character (U+221A)
  latex = latex.replace(/\u221A(\d+)/g, (match, num) => {
    return `\\sqrt{${num}}`;
  });
  latex = latex.replace(/sqrt\((\d+)\)/gi, (match, num) => {
    return `\\sqrt{${num}}`;
  });

  // Convert multiplication: "3x" → "3x" (already fine), "3*x" → "3 \cdot x"
  latex = latex.replace(/(\d+)\*([a-zA-Z])/g, (match, num, variable) => {
    return `${num} \\cdot ${variable}`;
  });

  // Convert variables: "x", "y" (keep as-is, but ensure proper spacing)
  // Already handled by LaTeX

  // Convert operators: "+", "-", "*", "/" (mostly fine, but handle multiplication)
  // Already handled above

  return latex;
}

/**
 * Identify math expressions in problem text
 */
function identifyMathExpressions(text: string): ProblemSegment[] {
  const segments: ProblemSegment[] = [];
  let currentText = "";
  let i = 0;

  while (i < text.length) {
    // Check for fraction pattern (e.g., "3/4")
    const fractionMatch = text.slice(i).match(/^(\d+)\/(\d+)/);
    if (fractionMatch) {
      // Add accumulated text as text segment
      if (currentText.trim()) {
        segments.push({ type: "text", content: currentText.trim() });
        currentText = "";
      }
      // Add fraction as math segment
      const fraction = fractionMatch[0];
      const latex = convertToLaTeX(fraction);
      segments.push({ type: "math", content: fraction, latex });
      i += fractionMatch[0].length;
      continue;
    }

    // Check for exponent pattern (e.g., "x^2", "x²")
    const exponentMatch = text.slice(i).match(/^([a-zA-Z0-9]+)\^(\d+)/);
    if (exponentMatch) {
      if (currentText.trim()) {
        segments.push({ type: "text", content: currentText.trim() });
        currentText = "";
      }
      const exponent = exponentMatch[0];
      const latex = convertToLaTeX(exponent);
      segments.push({ type: "math", content: exponent, latex });
      i += exponentMatch[0].length;
      continue;
    }

    // Check for square root pattern (e.g., "√16") - Unicode escape
    const sqrtMatch = text.slice(i).match(/^\u221A(\d+)/);
    if (sqrtMatch) {
      if (currentText.trim()) {
        segments.push({ type: "text", content: currentText.trim() });
        currentText = "";
      }
      const sqrt = sqrtMatch[0];
      const latex = convertToLaTeX(sqrt);
      segments.push({ type: "math", content: sqrt, latex });
      i += sqrtMatch[0].length;
      continue;
    }

    // Check for math expressions (simple patterns like "2x", "3x + 5", etc.)
    // For now, treat entire expressions as math if they contain math notation
    const mathPattern = /[a-zA-Z]\^|\u221A|\d+\/\d+|[a-zA-Z]\d+/;
    if (mathPattern.test(text.slice(i, i + 10))) {
      // Look ahead for math expression
      let mathEnd = i;
      while (
        mathEnd < text.length &&
        /[\w\s\+\-\*\/\^\u221A=]/.test(text[mathEnd])
      ) {
        mathEnd++;
      }
      const mathExpr = text.slice(i, mathEnd).trim();
      if (mathExpr && mathExpr.length > 1) {
        if (currentText.trim()) {
          segments.push({ type: "text", content: currentText.trim() });
          currentText = "";
        }
        const latex = convertToLaTeX(mathExpr);
        segments.push({ type: "math", content: mathExpr, latex });
        i = mathEnd;
        continue;
      }
    }

    // Accumulate text character
    currentText += text[i];
    i++;
  }

  // Add remaining text
  if (currentText.trim()) {
    segments.push({ type: "text", content: currentText.trim() });
  }

  // If no segments found, treat entire text as text
  if (segments.length === 0) {
    segments.push({ type: "text", content: text });
  }

  return segments;
}

/**
 * Render KaTeX expression to image
 * Dynamically imports browser-only libraries to avoid SSR issues
 */
async function renderKaTeXToImage(
  latex: string,
  fontSize: number = 24
): Promise<string> {
  // Ensure we're in browser environment
  if (typeof window === "undefined") {
    throw new Error(
      "renderKaTeXToImage can only be called in browser environment"
    );
  }

  try {
    // Dynamically import browser-only libraries
    const katex = (await import("katex")).default;
    const html2canvas = (await import("html2canvas")).default;

    // Render KaTeX to HTML
    const html = katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
      output: "html",
    });

    // Create temporary div element
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.fontSize = `${fontSize}px`;
    document.body.appendChild(tempDiv);

    // Convert HTML to canvas using html2canvas
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: null,
      scale: 2, // Higher quality
      logging: false,
    });

    // Get image data URL
    const imageData = canvas.toDataURL("image/png");

    // Clean up
    document.body.removeChild(tempDiv);

    return imageData;
  } catch (error) {
    console.error("Error rendering KaTeX to image:", error);
    throw error;
  }
}

/**
 * Render problem text to Konva elements
 */
export async function renderProblem(
  problem: MathProblem,
  startX: number = 20,
  startY: number = 40,
  fontSize: number = 24
): Promise<RenderedElement[]> {
  const elements: RenderedElement[] = [];
  let currentX = startX;
  let currentY = startY;
  const lineHeight = fontSize * 1.5;
  const spacing = 10;

  try {
    // Process problem text
    const segments = identifyMathExpressions(
      problem.parsedContent || problem.rawContent
    );

    for (const segment of segments) {
      if (segment.type === "text") {
        // Render text segment
        elements.push({
          type: "text",
          content: segment.content,
          position: { x: currentX, y: currentY },
          size: {
            width: segment.content.length * (fontSize * 0.6), // Approximate width
            height: fontSize,
          },
        });
        currentX += segment.content.length * (fontSize * 0.6) + spacing;
      } else if (segment.type === "math" && segment.latex) {
        // Render math segment as image
        try {
          const imageData = await renderKaTeXToImage(segment.latex, fontSize);
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageData;
          });

          elements.push({
            type: "image",
            content: imageData,
            position: { x: currentX, y: currentY },
            size: {
              width: img.width,
              height: img.height,
            },
            // Register semantic IDs for key elements
            semanticId: segment.content.includes("/")
              ? `fraction_${elements.length}`
              : segment.content.includes("^") ||
                segment.content.includes("\u00B2")
              ? `exponent_${elements.length}`
              : segment.content.includes("\u221A")
              ? `sqrt_${elements.length}`
              : undefined,
          });
          currentX += img.width + spacing;
        } catch (error) {
          // Fallback to plain text if KaTeX rendering fails
          console.error("KaTeX rendering failed, using plain text:", error);
          elements.push({
            type: "text",
            content: segment.content,
            position: { x: currentX, y: currentY },
            size: {
              width: segment.content.length * (fontSize * 0.6),
              height: fontSize,
            },
          });
          currentX += segment.content.length * (fontSize * 0.6) + spacing;
        }
      }
    }

    return elements;
  } catch (error) {
    // Fallback to plain text if processing fails
    console.error("Problem rendering failed, using plain text:", error);
    return [
      {
        type: "text",
        content: problem.parsedContent || problem.rawContent,
        position: { x: startX, y: startY },
        size: {
          width:
            (problem.parsedContent || problem.rawContent).length *
            (fontSize * 0.6),
          height: fontSize,
        },
      },
    ];
  }
}
