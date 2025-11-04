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
import { Stage, Layer, Text, Image as KonvaImage, Line } from "react-konva";
import type Konva from "konva";
import type { MathProblem } from "@/types/models";
import { renderProblem } from "@/services/canvas/problemRenderer";
import { semanticRegistry } from "@/services/canvas/semanticRegistry";
import type { RenderedElement } from "@/services/canvas/problemRenderer";
import { useCanvasStore } from "@/stores/useCanvasStore";
import type { Line as LineType } from "@/types/canvas";

interface WhiteboardProps {
  width?: number;
  height?: number;
  problem?: MathProblem | null;
  onClear?: () => void;
}

export interface WhiteboardRef {
  clearCanvas: () => void;
  clearDrawings: () => void;
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

    // Canvas store for drawing state
    const { lines, isDrawing, addLine, setIsDrawing, clearAllLines } =
      useCanvasStore();

    // Local state for current drawing line
    const [currentLine, setCurrentLine] = useState<number[]>([]);

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
          const elements = await renderProblem(problem, 20, 40, 24);
          setRenderedElements(elements);

          // Register semantic elements
          semanticRegistry.clear();
          for (const element of elements) {
            if (element.semanticId) {
              semanticRegistry.register(
                element.semanticId,
                element.position,
                element.size,
                element.semanticId.replace(/_/g, " ")
              );
            }
          }

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
          // Fallback to plain text
          setRenderedElements([
            {
              type: "text",
              content: problem.parsedContent || problem.rawContent,
              position: { x: 20, y: 40 },
              size: {
                width:
                  (problem.parsedContent || problem.rawContent).length * 14,
                height: 24,
              },
            },
          ]);
        } finally {
          setIsRendering(false);
        }
      })();
    }, [problem]);

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

    // Expose clearCanvas and clearDrawings methods via ref
    useImperativeHandle(ref, () => ({
      clearCanvas,
      clearDrawings,
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
            {/* Render problem elements */}
            {renderedElements.map((element, index) => {
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
