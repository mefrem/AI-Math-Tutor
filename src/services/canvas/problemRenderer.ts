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
  annotationOnly?: boolean; // If true, don't render but use for annotation tracking
}

/**
 * Problem bounding box (min/max coordinates)
 */
export interface ProblemBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Element token for parsing
 */
interface ElementToken {
  type:
    | "number"
    | "variable"
    | "operator"
    | "name"
    | "percentage"
    | "question"
    | "object"
    | "text";
  content: string;
  originalIndex: number; // Original position in text
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

    // Check for math expressions (ONLY actual math notation, not simple algebra)
    // Only treat fractions, exponents, and square roots as math segments
    // Simple equations like "2x + 5 = 13" should be treated as text so individual elements can be tracked
    const mathPattern = /[a-zA-Z]\^|\u221A|\d+\/\d+/;
    if (mathPattern.test(text.slice(i, i + 10))) {
      // Look ahead for math expression (only for actual math notation)
      let mathEnd = i;
      while (
        mathEnd < text.length &&
        /[\w\s\+\-\*\/\^\u221A]/.test(text[mathEnd]) &&
        !text[mathEnd].match(/[=<>]/) // Stop at operators like = to avoid treating equations as math
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
 * Break text into words for wrapping
 */
function breakTextIntoWords(text: string): string[] {
  // Split by spaces, but keep punctuation attached to words
  return text.split(/\s+/).filter((word) => word.length > 0);
}

/**
 * Calculate actual text width in pixels using canvas measurement
 * This is more accurate than approximation for proper annotation positioning
 */
function calculateTextWidth(
  text: string,
  fontSize: number,
  fontFamily: string = "Arial, sans-serif"
): number {
  // Use canvas API for accurate text measurement (client-side only)
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        // Set font to match Konva Text component exactly
        context.font = `${fontSize}px ${fontFamily}`;
        const metrics = context.measureText(text);
        const width = metrics.width;

        // Debug: Log measurement for "5" specifically
        if (text === "5") {
          console.log(`[ProblemRenderer] Canvas measurement for "5":`, {
            fontSize,
            fontFamily,
            width,
            approximation: text.length * fontSize * 0.6,
          });
        }

        return width;
      }
    } catch (error) {
      console.warn(
        "[ProblemRenderer] Canvas measurement failed, using approximation:",
        error
      );
    }
  }

  // Fallback to approximation if canvas not available (server-side or error)
  // This should only happen during server-side rendering
  const approximation = text.length * fontSize * 0.6;

  // Debug: Log fallback for "5" specifically
  if (text === "5") {
    console.warn(`[ProblemRenderer] Using approximation for "5":`, {
      fontSize,
      approximation,
      isClient: typeof window !== "undefined",
    });
  }

  return approximation;
}

/**
 * Wrap text to fit within canvas width
 */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = breakTextIntoWords(text);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = calculateTextWidth(testLine, fontSize);

    if (testWidth <= maxWidth || currentLine === "") {
      // Word fits on current line, or it's the first word (always add it)
      currentLine = testLine;
    } else {
      // Word doesn't fit, start new line
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  // Add remaining line
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

/**
 * Extract named entities (capitalized names) from text
 */
function extractNamedEntities(text: string): { name: string; index: number }[] {
  const entities: { name: string; index: number }[] = [];
  // Match capitalized words that look like names (at least 2 chars, may have punctuation after)
  const namePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g;
  let match;

  while ((match = namePattern.exec(text)) !== null) {
    entities.push({
      name: match[0],
      index: match.index,
    });
  }

  return entities;
}

/**
 * Extract percentages from text (e.g., "20%", "50 percent")
 */
function extractPercentages(
  text: string
): { percentage: string; index: number }[] {
  const percentages: { percentage: string; index: number }[] = [];
  // Match percentages: "20%", "50 percent", "50%"
  const percentPattern = /\b(\d+)\s*(?:%|percent)\b/gi;
  let match;

  while ((match = percentPattern.exec(text)) !== null) {
    percentages.push({
      percentage: match[0],
      index: match.index,
    });
  }

  return percentages;
}

/**
 * Extract question words (e.g., "how many", "what", "when")
 */
function extractQuestionWords(
  text: string
): { question: string; index: number }[] {
  const questions: { question: string; index: number }[] = [];
  // Match question phrases
  const questionPattern =
    /\b(how\s+many|how\s+much|what|when|where|why|which)\b/gi;
  let match;

  while ((match = questionPattern.exec(text)) !== null) {
    questions.push({
      question: match[0],
      index: match.index,
    });
  }

  return questions;
}

/**
 * Break text into individual elements (numbers, variables, operators, names, percentages, etc.)
 */
function breakTextIntoElements(text: string): ElementToken[] {
  const tokens: ElementToken[] = [];
  const processedIndices = new Set<number>();

  // Extract named entities
  const names = extractNamedEntities(text);
  for (const { name, index } of names) {
    for (let i = index; i < index + name.length; i++) {
      processedIndices.add(i);
    }
    tokens.push({
      type: "name",
      content: name,
      originalIndex: index,
    });
  }

  // Extract percentages
  const percentages = extractPercentages(text);
  for (const { percentage, index } of percentages) {
    for (let i = index; i < index + percentage.length; i++) {
      processedIndices.add(i);
    }
    tokens.push({
      type: "percentage",
      content: percentage,
      originalIndex: index,
    });
  }

  // Extract question words
  const questions = extractQuestionWords(text);
  for (const { question, index } of questions) {
    for (let i = index; i < index + question.length; i++) {
      processedIndices.add(i);
    }
    tokens.push({
      type: "question",
      content: question,
      originalIndex: index,
    });
  }

  // Process remaining text character by character
  let i = 0;
  while (i < text.length) {
    if (processedIndices.has(i)) {
      i++;
      continue;
    }

    const char = text[i];

    // Numbers
    if (/\d/.test(char)) {
      let number = "";
      let startIndex = i;
      while (i < text.length && /\d/.test(text[i])) {
        number += text[i];
        i++;
      }
      tokens.push({
        type: "number",
        content: number,
        originalIndex: startIndex,
      });
      continue;
    }

    // Variables (single letters)
    if (/[a-zA-Z]/.test(char)) {
      let variable = "";
      let startIndex = i;
      while (i < text.length && /[a-zA-Z]/.test(text[i])) {
        variable += text[i];
        i++;
      }
      // Check if it's actually a word (not a variable)
      if (variable.length > 1 && !processedIndices.has(startIndex)) {
        // Treat as text/object
        tokens.push({
          type: "object",
          content: variable.toLowerCase(),
          originalIndex: startIndex,
        });
      } else if (variable.length === 1) {
        // Single letter = variable
        tokens.push({
          type: "variable",
          content: variable,
          originalIndex: startIndex,
        });
      }
      continue;
    }

    // Operators
    if (/[+\-*/=<>]/.test(char)) {
      tokens.push({
        type: "operator",
        content: char,
        originalIndex: i,
      });
      i++;
      continue;
    }

    // Other characters (spaces, punctuation) - skip or treat as text
    i++;
  }

  // Sort tokens by original index
  tokens.sort((a, b) => a.originalIndex - b.originalIndex);

  return tokens;
}

/**
 * Generate semantic ID for an element
 */
function generateSemanticId(
  token: ElementToken,
  elementIndex: number,
  instanceCount: Map<string, number>
): string {
  const baseId = `${token.type}_${token.content
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")}`;

  // Handle multi-instance elements (e.g., "apples" appears twice)
  if (instanceCount.has(baseId)) {
    const count = instanceCount.get(baseId)! + 1;
    instanceCount.set(baseId, count);
    return `${baseId}_${count}`;
  } else {
    instanceCount.set(baseId, 1);
    return baseId;
  }
}

/**
 * Calculate problem bounding box from rendered elements
 */
export function calculateProblemBounds(
  elements: RenderedElement[]
): ProblemBounds | null {
  if (elements.length === 0) {
    return null;
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const element of elements) {
    const x = element.position.x;
    const y = element.position.y;
    const width = element.size.width;
    const height = element.size.height;

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + width);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + height);
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Render problem text to Konva elements
 */
export async function renderProblem(
  problem: MathProblem,
  startX: number = 20,
  startY: number = 40,
  fontSize: number = 24,
  canvasWidth?: number, // Canvas width for text wrapping
  centerText: boolean = true // Center text horizontally on canvas
): Promise<RenderedElement[]> {
  const elements: RenderedElement[] = [];
  let currentX = startX;
  let currentY = startY;
  const lineHeight = fontSize * 1.5;
  const spacing = 10;

  // Calculate available width for text wrapping
  // Leave padding on both sides (20px each) and some margin
  const padding = 40;
  const maxTextWidth = canvasWidth
    ? canvasWidth - padding * 2 // Padding on both sides
    : 600; // Default max width if not provided

  try {
    // Process problem text
    const segments = identifyMathExpressions(
      problem.parsedContent || problem.rawContent
    );

    // Track instance counts for multi-instance elements
    const instanceCount = new Map<string, number>();

    for (const segment of segments) {
      if (segment.type === "text") {
        // Render text as wrapped lines (simple approach)
        const wrappedLines = wrapText(segment.content, maxTextWidth, fontSize);

        for (let i = 0; i < wrappedLines.length; i++) {
          const line = wrappedLines[i];
          const lineWidth = calculateTextWidth(line, fontSize);

          let xPosition = currentX;
          if (centerText && canvasWidth) {
            xPosition = (canvasWidth - lineWidth) / 2;
          }

          // Render the full line
          elements.push({
            type: "text",
            content: line,
            position: { x: xPosition, y: currentY },
            size: {
              width: lineWidth,
              height: fontSize,
            },
          });

          // Track individual elements within this line for annotation
          // Use actual canvas measurement for accurate positioning
          const textElements = breakTextIntoElements(line);

          // Track cumulative width as we iterate through tokens
          // This ensures accurate positioning even with spaces
          let cumulativeX = xPosition;

          // Track which characters have been matched to avoid duplicates
          const matchedIndices = new Set<number>();

          // Debug: Log all tokens for this line
          if (line.includes("2") || line.includes("x")) {
            console.log(
              `[ProblemRenderer] Processing tokens for line "${line}":`,
              {
                tokens: textElements.map((t) => ({
                  type: t.type,
                  content: t.content,
                  originalIndex: t.originalIndex,
                })),
                lineLength: line.length,
              }
            );
          }

          for (const token of textElements) {
            // Find token in the line - need to handle spaces correctly
            // Token might not match exactly due to spaces, so find it by searching
            let tokenIndex = -1;
            let searchStart = 0;

            // Find the token in the line, accounting for spaces and already matched tokens
            while (searchStart < line.length) {
              const found = line.indexOf(token.content, searchStart);
              if (found === -1) break;

              // Check if this position is already matched by a previous token
              let alreadyMatched = false;
              for (let j = found; j < found + token.content.length; j++) {
                if (matchedIndices.has(j)) {
                  alreadyMatched = true;
                  break;
                }
              }

              if (alreadyMatched) {
                searchStart = found + 1;
                continue;
              }

              // Check if this is the right token (not part of a larger token)
              const before = found > 0 ? line[found - 1] : "";
              const after =
                found + token.content.length < line.length
                  ? line[found + token.content.length]
                  : "";

              // Token should be separated by spaces or operators, or at start/end
              // BUT: allow adjacent alphanumeric characters if they match the token type
              // (e.g., "2" followed by "x" - both are valid tokens)
              const isSeparated =
                !/[a-zA-Z0-9]/.test(before) && !/[a-zA-Z0-9]/.test(after);
              const isAdjacentValid =
                (token.type === "number" && /[a-zA-Z]/.test(after)) || // "2" followed by "x" is valid
                (token.type === "variable" && /\d/.test(before)) || // "x" preceded by "2" is valid
                (token.type === "variable" &&
                  /[a-zA-Z]/.test(after) &&
                  token.content.length === 1); // "x" followed by letter (but single char)

              if (isSeparated || isAdjacentValid) {
                tokenIndex = found;
                // Mark these indices as matched
                for (let j = found; j < found + token.content.length; j++) {
                  matchedIndices.add(j);
                }
                break;
              }
              searchStart = found + 1;
            }

            // Debug: Log if token not found (especially for "2" and "x")
            if (
              tokenIndex < 0 &&
              (token.content === "2" || token.content === "x")
            ) {
              console.warn(
                `[ProblemRenderer] Token "${token.content}" (${token.type}) not found in line "${line}"`,
                {
                  token,
                  line,
                  matchedIndices: Array.from(matchedIndices).sort(
                    (a, b) => a - b
                  ),
                }
              );
            }

            if (tokenIndex >= 0) {
              // Calculate width of text from line start to start of this token
              // This includes all spaces and characters before the token
              const textBeforeToken = line.substring(0, tokenIndex);
              const textWidthBefore = calculateTextWidth(
                textBeforeToken,
                fontSize
              );
              const elementWidth = calculateTextWidth(token.content, fontSize);
              const semanticId = generateSemanticId(
                token,
                elements.length,
                instanceCount
              );

              // Position is line start + actual width of text before this element
              // Use the calculated width, not cumulative (cumulative can drift)
              const actualX = xPosition + textWidthBefore;

              // Debug: Log position calculation for specific elements
              if (
                (token.content === "5" && token.type === "number") ||
                (token.content === "2" && token.type === "number") ||
                (token.content === "x" && token.type === "variable") ||
                (token.content === "=" && token.type === "operator")
              ) {
                console.log(
                  `[ProblemRenderer] Calculating position for "${token.content}":`,
                  {
                    line,
                    tokenIndex,
                    textBeforeToken,
                    textWidthBefore,
                    elementWidth,
                    xPosition,
                    actualX,
                    semanticId,
                    tokenType: token.type,
                    registeredElements: elements.filter((e) => e.semanticId)
                      .length,
                  }
                );
              }

              // Register element for annotation tracking (but don't render separately)
              elements.push({
                type: "text",
                content: token.content,
                position: { x: actualX, y: currentY },
                size: {
                  width: elementWidth,
                  height: fontSize,
                },
                semanticId,
                annotationOnly: true, // Mark as annotation-only, don't render
              });

              // Update cumulative position for next iteration
              cumulativeX = actualX + elementWidth;
            }
          }

          // Move to next line
          if (i < wrappedLines.length - 1) {
            currentY += lineHeight;
            currentX = centerText ? startX : startX;
          } else {
            if (!centerText) {
              currentX += lineWidth + spacing;
            }
          }
        }
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

          // Calculate position for math image
          let mathX = currentX;
          if (centerText && canvasWidth) {
            // Center math image on canvas
            mathX = (canvasWidth - img.width) / 2;
          } else {
            // Check if math image fits on current line, otherwise move to next line
            if (
              currentX + img.width > maxTextWidth + startX &&
              currentX > startX
            ) {
              // Math doesn't fit, move to next line
              currentY += lineHeight;
              currentX = startX;
              mathX = currentX;
            }
          }

          // Generate semantic ID for math expression
          const mathSemanticId = segment.content.includes("/")
            ? `fraction_${elements.length}`
            : segment.content.includes("^") ||
              segment.content.includes("\u00B2")
            ? `exponent_${elements.length}`
            : segment.content.includes("\u221A")
            ? `sqrt_${elements.length}`
            : undefined;

          elements.push({
            type: "image",
            content: imageData,
            position: { x: mathX, y: currentY },
            size: {
              width: img.width,
              height: img.height,
            },
            semanticId: mathSemanticId,
          });

          // Track individual elements within math expressions for annotation
          // Break down math expressions into individual elements (numbers, variables, operators)
          const mathElements = breakTextIntoElements(segment.content);
          let mathElementX = mathX;

          for (const token of mathElements) {
            const elementWidth = calculateTextWidth(token.content, fontSize);
            const semanticId = generateSemanticId(
              token,
              elements.length,
              instanceCount
            );

            // Estimate position within math image (approximate based on character positions)
            const tokenIndex = segment.content.indexOf(token.content);
            const textBeforeToken = segment.content.substring(0, tokenIndex);
            const widthBefore = calculateTextWidth(textBeforeToken, fontSize);

            // Scale positions to match rendered image width
            const totalTextWidth = calculateTextWidth(
              segment.content,
              fontSize
            );
            const scaleFactor = img.width / totalTextWidth;

            elements.push({
              type: "text",
              content: token.content,
              position: {
                x: mathX + widthBefore * scaleFactor,
                y: currentY,
              },
              size: {
                width: elementWidth * scaleFactor,
                height: fontSize,
              },
              semanticId,
              annotationOnly: true,
            });

            mathElementX += elementWidth;
          }
          // Update X position for next element (only if not centering)
          if (!centerText) {
            currentX += img.width + spacing;
          } else {
            // For centered text, move to next line after math
            currentY += lineHeight;
          }
        } catch (error) {
          // Fallback to plain text if KaTeX rendering fails
          console.error("KaTeX rendering failed, using plain text:", error);
          const wrappedLines = wrapText(
            segment.content,
            maxTextWidth,
            fontSize
          );

          for (let i = 0; i < wrappedLines.length; i++) {
            const line = wrappedLines[i];
            const lineWidth = calculateTextWidth(line, fontSize);

            // Center text if requested
            let xPosition = currentX;
            if (centerText && canvasWidth) {
              xPosition = (canvasWidth - lineWidth) / 2;
            }

            elements.push({
              type: "text",
              content: line,
              position: { x: xPosition, y: currentY },
              size: {
                width: lineWidth,
                height: fontSize,
              },
            });

            if (i < wrappedLines.length - 1) {
              currentY += lineHeight;
              currentX = startX;
            } else {
              if (!centerText) {
                currentX += lineWidth + spacing;
              }
            }
          }
        }
      }
    }

    return elements;
  } catch (error) {
    // Fallback to plain text if processing fails
    console.error("Problem rendering failed, using plain text:", error);
    const fullText = problem.parsedContent || problem.rawContent;
    const wrappedLines = wrapText(fullText, maxTextWidth, fontSize);

    const fallbackElements: RenderedElement[] = [];
    let fallbackY = startY;

    for (const line of wrappedLines) {
      const lineWidth = calculateTextWidth(line, fontSize);

      // Center text if requested
      let xPosition = startX;
      if (centerText && canvasWidth) {
        xPosition = (canvasWidth - lineWidth) / 2;
      }

      fallbackElements.push({
        type: "text",
        content: line,
        position: { x: xPosition, y: fallbackY },
        size: {
          width: lineWidth,
          height: fontSize,
        },
      });
      fallbackY += lineHeight;
    }

    return fallbackElements;
  }
}
