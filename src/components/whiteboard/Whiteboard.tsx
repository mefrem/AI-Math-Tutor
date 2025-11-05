/**
 * Whiteboard component
 * Canvas component for rendering mathematical notation and supporting future drawing interactions
 * Uses Konva.js for canvas rendering
 */

"use client";

import {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Stage,
  Layer,
  Text,
  Image as KonvaImage,
  Line,
  Rect,
  Ellipse,
} from "react-konva";
import type Konva from "konva";
import type { MathProblem } from "@/types/models";
import { renderProblem } from "@/services/canvas/problemRenderer";
import { semanticRegistry } from "@/services/canvas/semanticRegistry";
import type { RenderedElement } from "@/services/canvas/problemRenderer";
import { useCanvasStore } from "@/stores/useCanvasStore";
import type { Line as LineType } from "@/types/canvas";
import { CanvasFPSMonitor } from "@/utils/performance";

interface WhiteboardProps {
  width?: number;
  height?: number;
  problem?: MathProblem | null;
  onClear?: () => void;
}

export interface WhiteboardRef {
  clearCanvas: () => void;
  clearDrawings: () => void;
  captureSnapshot: () => Promise<string>;
  getSemanticElements: () => Promise<Array<{ id: string; bounds: { x: number; y: number; width: number; height: number } }>>;
}

/**
 * Default canvas dimensions
 */
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const MIN_WIDTH = 600;
const MIN_HEIGHT = 400;

/**
 * Whiteboard component using Konva.js
 */
export const Whiteboard = forwardRef<WhiteboardRef, WhiteboardProps>(
  (
    { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, problem, onClear },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const drawingLayerRef = useRef<Konva.Layer>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const [canvasSize, setCanvasSize] = useState({
      width: Math.max(MIN_WIDTH, width),
      height: Math.max(MIN_HEIGHT, height),
    });
    const [renderedElements, setRenderedElements] = useState<RenderedElement[]>(
      []
    );
    const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(
      new Map()
    );
    const [isRendering, setIsRendering] = useState(false);

    // Canvas store for drawing state and annotations
    const {
      lines,
      isDrawing,
      addLine,
      setIsDrawing,
      clearAllLines,
      tutorAnnotations,
    } = useCanvasStore();

    // Local state for current drawing line
    const [currentLine, setCurrentLine] = useState<number[]>([]);

    // Story 5.2: Canvas FPS monitoring
    const fpsMonitorRef = useRef<CanvasFPSMonitor | null>(null);

    /**
     * Initialize and monitor canvas FPS
     * Story 5.2: Performance measurement
     */
    useEffect(() => {
      // Start FPS monitoring
      const monitor = new CanvasFPSMonitor();
      fpsMonitorRef.current = monitor;

      // Monitor FPS (only log in development)
      monitor.start((fps) => {
        // Store FPS in performance monitor for reporting
        if (process.env.NODE_ENV === 'development') {
          // FPS logging disabled per user request
          // console.log(`[Performance] Canvas FPS: ${fps}`);
        }
      });

      return () => {
        // Stop FPS monitoring on unmount
        monitor.stop();
      };
    }, []);

    /**
     * Handle window resize and container sizing
     */
    useEffect(() => {
      const handleResize = () => {
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          const containerHeight = containerRef.current.clientHeight;

          // Calculate canvas size based on container
          // Canvas should fill container while maintaining minimum size
          const calculatedWidth = Math.max(MIN_WIDTH, containerWidth);
          const calculatedHeight = Math.max(MIN_HEIGHT, containerHeight);

          setCanvasSize({
            width: calculatedWidth,
            height: calculatedHeight,
          });
        }
      };

      // Set initial size
      handleResize();

      // Use ResizeObserver for better container size tracking
      const resizeObserver = new ResizeObserver(handleResize);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      // Also listen for window resize events
      window.addEventListener("resize", handleResize);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    /**
     * Render problem on canvas
     */
    useEffect(() => {
      if (!problem) {
        setRenderedElements([]);
        semanticRegistry.clear();
        return;
      }

      setIsRendering(true);
      (async () => {
        try {
          // Position problem with padding, allowing text to wrap
          const startX = 20; // Left padding
          const startY = 40; // Top padding
          // Pass canvas width for text wrapping (no centering for simpler annotation tracking)
          const elements = await renderProblem(problem, startX, startY, 24, canvasSize.width, false);
          setRenderedElements(elements);

          // Register semantic elements
          semanticRegistry.clear();
          // Also import and register with annotationResolver
          const { annotationResolver } = await import("@/services/annotationResolver");
          annotationResolver.clearElements();
          
          // Register all elements with semantic IDs
          for (const element of elements) {
            if (element.semanticId) {
              // Register in semanticRegistry (for display/tracking)
              semanticRegistry.register(
                element.semanticId,
                element.position,
                element.size,
                element.semanticId.replace(/_/g, " ")
              );
              // Also register in annotationResolver (for annotation resolution)
              // Use exact bounds from rendered element
              const bounds = {
                x: element.position.x,
                y: element.position.y,
                width: element.size.width,
                height: element.size.height,
              };
              
              annotationResolver.registerElement(
                element.semanticId,
                bounds
              );
              
              // Register with normalized ID (without underscores) for better matching
              const normalizedId = element.semanticId.replace(/_/g, " ");
              annotationResolver.registerElement(
                normalizedId,
                bounds // Use same bounds for normalized ID
              );
              
              // Debug: Log registration for specific elements
              if ((element.semanticId.includes('number_5') || element.semanticId === 'number 5') ||
                  (element.semanticId.includes('number_2') || element.semanticId === 'number 2') ||
                  (element.semanticId.includes('variable_x') || element.semanticId === 'variable x')) {
                console.log(`[Whiteboard] Registered "${element.content}" element:`, {
                  semanticId: element.semanticId,
                  bounds,
                  content: element.content,
                  position: element.position,
                  size: element.size,
                });
              }
            }
          }
          
          // Update annotationResolver canvas dimensions
          annotationResolver.updateCanvasDimensions(canvasSize.width, canvasSize.height);
          
          // Update problem bounds after all elements are registered
          annotationResolver.updateProblemBounds();

          // Preload images
          const newCache = new Map<string, HTMLImageElement>();
          const imagePromises: Promise<void>[] = [];
          for (const element of elements) {
            if (element.type === "image") {
              if (imageCache.has(element.content)) {
                newCache.set(element.content, imageCache.get(element.content)!);
              } else {
                const img = new Image();
                const promise = new Promise<void>((resolve, reject) => {
                  img.onload = () => {
                    newCache.set(element.content, img);
                    resolve();
                  };
                  img.onerror = reject;
                  img.src = element.content;
                });
                imagePromises.push(promise);
              }
            }
          }

          // Wait for all images to load
          await Promise.all(imagePromises);
          setImageCache(newCache);
        } catch (error: unknown) {
          console.error("Error rendering problem:", error);
          // Fallback to plain text with wrapping and centering
          const startX = 20;
          const startY = 40;
          const fallbackText = problem.parsedContent || problem.rawContent;
          const maxTextWidth = canvasSize.width - 40; // Padding on both sides
          const fontSize = 24;
          
          // Simple word wrapping for fallback
          const words = fallbackText.split(/\s+/);
          const lines: string[] = [];
          let currentLine = "";
          
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = testLine.length * fontSize * 0.6;
            
            if (testWidth <= maxTextWidth || currentLine === "") {
              currentLine = testLine;
            } else {
              if (currentLine) lines.push(currentLine);
              currentLine = word;
            }
          }
          if (currentLine) lines.push(currentLine);
          
          const lineHeight = fontSize * 1.5;
          const fallbackElements = lines.map((line, index) => {
            const lineWidth = line.length * fontSize * 0.6;
            // Center each line
            const xPosition = (canvasSize.width - lineWidth) / 2;
            return {
              type: "text" as const,
              content: line,
              position: { x: xPosition, y: startY + index * lineHeight },
              size: {
                width: lineWidth,
                height: fontSize,
              },
            };
          });
          
          setRenderedElements(fallbackElements);
        } finally {
          setIsRendering(false);
        }
      })();
    }, [problem, canvasSize]); // Re-render when canvas size changes

    /**
     * Handle mouse/touch down - start drawing
     */
    const handlePointerDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      setIsDrawing(true);
      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      setCurrentLine([pos.x, pos.y]);
    };

    /**
     * Handle mouse/touch move - continue drawing
     */
    const handlePointerMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isDrawing) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Add point to current line
      setCurrentLine((prev) => [...prev, pos.x, pos.y]);
    };

    /**
     * Handle mouse/touch up - finish drawing
     */
    const handlePointerUp = () => {
      if (!isDrawing) return;
      setIsDrawing(false);

      // Save the completed line to store
      if (currentLine.length >= 4) {
        // At least 2 points (x1, y1, x2, y2)
        const newLine: LineType = {
          id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          points: currentLine,
          color: "#4A90E2", // Medium blue
          strokeWidth: 4,
          timestamp: Date.now(),
        };
        addLine(newLine);
      }

      // Reset current line
      setCurrentLine([]);
    };

    /**
     * Clear all student drawings (keep problem visible)
     */
    const clearDrawings = () => {
      clearAllLines();
      setCurrentLine([]);
    };

    /**
     * Capture canvas as base64-encoded image snapshot
     * Story 3.2: Canvas State Serialization
     * Includes problem rendering + student drawings + future tutor annotations
     * Returns data URL (PNG or JPEG if size > 1MB)
     */
    const captureSnapshot = async (): Promise<string> => {
      if (!stageRef.current) {
        throw new Error("Canvas stage not initialized");
      }

      try {
        // Capture as PNG first (best quality, preserves colors)
        const pngDataUrl = stageRef.current.toDataURL({
          pixelRatio: 1, // 1:1 pixel ratio for optimal file size
          mimeType: "image/png",
        });

        // Check file size (base64 string length * 0.75 ≈ bytes)
        const estimatedSizeBytes = (pngDataUrl.length * 0.75);
        const maxSizeBytes = 1 * 1024 * 1024; // 1MB

        // If PNG is too large, convert to JPEG with compression
        if (estimatedSizeBytes > maxSizeBytes) {
          console.log(
            `PNG snapshot size (${(estimatedSizeBytes / 1024).toFixed(1)}KB) exceeds 1MB, converting to JPEG`
          );
          const jpegDataUrl = stageRef.current.toDataURL({
            pixelRatio: 1,
            mimeType: "image/jpeg",
            quality: 0.8, // 80% quality for good balance
          });
          return jpegDataUrl;
        }

        return pngDataUrl;
      } catch (error) {
        console.error("Error capturing canvas snapshot:", error);
        throw new Error("Failed to capture canvas snapshot");
      }
    };

    /**
     * Clear canvas
     */
    const clearCanvas = () => {
      // Clear canvas by removing all children from the layer
      if (layerRef.current) {
        const layer = layerRef.current;
        layer.destroyChildren();
        layer.draw();
      }

      // Clear rendered elements and semantic registry
      setRenderedElements([]);
      semanticRegistry.clear();

      // Clear drawings
      clearDrawings();

      // Call optional onClear callback
      if (onClear) {
        onClear();
      }
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      clearCanvas,
      clearDrawings,
      captureSnapshot,
      getSemanticElements: async () => {
        // Import annotationResolver dynamically to get client-side elements
        const { annotationResolver } = await import("@/services/annotationResolver");
        const allElements = annotationResolver.getAllSemanticElements();
        const elements: Array<{ id: string; bounds: { x: number; y: number; width: number; height: number } }> = [];
        for (const [id, element] of allElements) {
          elements.push({
            id,
            bounds: element.bounds,
          });
        }
        console.log(`[Whiteboard] getSemanticElements: returning ${elements.length} elements`);
        return elements;
      },
    }));

    return (
      <div
        ref={containerRef}
        className="w-full h-full bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
        style={{ minWidth: MIN_WIDTH, minHeight: MIN_HEIGHT }}
        aria-label="Whiteboard canvas"
      >
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ backgroundColor: "#FFFFFF" }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          {/* Problem rendering layer */}
          <Layer ref={layerRef}>
            {/* Render problem elements (skip annotation-only elements) */}
            {renderedElements
              .filter((element) => !element.annotationOnly)
              .map((element, index) => {
                if (element.type === "text") {
                  return (
                    <Text
                      key={`text-${index}`}
                      x={element.position.x}
                      y={element.position.y}
                      text={element.content}
                      fontSize={24}
                      fontFamily="Arial, sans-serif"
                      fill="#333333"
                      width={element.size.width}
                      wrap="word"
                    />
                  );
                } else if (element.type === "image") {
                  const img = imageCache.get(element.content);
                  if (img) {
                    return (
                      <KonvaImage
                        key={`image-${index}`}
                        x={element.position.x}
                        y={element.position.y}
                        image={img}
                        width={element.size.width}
                        height={element.size.height}
                      />
                    );
                  }
                  return null;
                }
                return null;
              })}

            {/* Loading indicator */}
            {isRendering && (
              <Text
                x={20}
                y={20}
                text="Rendering problem..."
                fontSize={18}
                fontFamily="Arial, sans-serif"
                fill="#666666"
              />
            )}

            {/* Show "Canvas Ready" if no problem */}
            {!problem && renderedElements.length === 0 && !isRendering && (
              <Text
                x={20}
                y={40}
                text="Canvas Ready"
                fontSize={24}
                fontFamily="Arial, sans-serif"
                fill="#999999"
              />
            )}
          </Layer>

          {/* Annotation layer for tutor highlights/circles (Story 3.4) */}
          <Layer>
            {tutorAnnotations.map((annotation) => {
              const { bounds, type, id, target } = annotation;
              
              // Validate bounds
              if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
                console.warn(`[Whiteboard] Invalid annotation bounds for "${target}":`, bounds);
                return null;
              }
              
              if (type === "highlight") {
                // Semi-transparent orange rectangle
                return (
                  <Rect
                    key={id}
                    x={bounds.x}
                    y={bounds.y}
                    width={bounds.width}
                    height={bounds.height}
                    fill="#FF9800"
                    opacity={0.3}
                  />
                );
              } else if (type === "circle") {
                // Orange ellipse/circle stroke
                return (
                  <Ellipse
                    key={id}
                    x={bounds.x + bounds.width / 2}
                    y={bounds.y + bounds.height / 2}
                    radiusX={Math.max(bounds.width / 2, 5)}
                    radiusY={Math.max(bounds.height / 2, 5)}
                    stroke="#FF9800"
                    strokeWidth={3}
                    fill="transparent"
                  />
                );
              }
              return null;
            })}
          </Layer>

          {/* Drawing layer for student work */}
          <Layer ref={drawingLayerRef}>
            {/* Render all completed lines */}
            {lines.map((line) => (
              <Line
                key={line.id}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"
              />
            ))}

            {/* Render current line being drawn */}
            {currentLine.length > 0 && (
              <Line
                points={currentLine}
                stroke="#4A90E2"
                strokeWidth={4}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"
              />
            )}
          </Layer>
        </Stage>
      </div>
    );
  }
);

Whiteboard.displayName = "Whiteboard";
