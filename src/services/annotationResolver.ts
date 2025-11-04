/**
 * Annotation Resolver Service
 * Story 3.4: Tutor Highlighting and Circling Capability
 *
 * Implements 3-tier resolution strategy to translate natural language targets
 * (e.g., "numerator", "left side") into canvas coordinates.
 *
 * Tier 1: Fuzzy semantic ID matching (from problem rendering)
 * Tier 2: Predefined region matching (common canvas regions)
 * Tier 3: Silent failure (graceful degradation)
 */

/**
 * Bounding box for annotations
 */
export interface AnnotationBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Semantic element registration (from problem rendering)
 * Elements are registered during KaTeX rendering with bounding boxes
 */
interface SemanticElement {
  id: string;
  bounds: AnnotationBounds;
}

/**
 * Annotation Resolver Class
 */
export class AnnotationResolver {
  private semanticElements: Map<string, SemanticElement> = new Map();
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvasWidth: number = 800, canvasHeight: number = 600) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Register a semantic element from problem rendering
   * Called during KaTeX rendering to track element locations
   */
  registerElement(id: string, bounds: AnnotationBounds): void {
    this.semanticElements.set(id, { id, bounds });
  }

  /**
   * Clear all registered semantic elements
   * Called when problem changes
   */
  clearElements(): void {
    this.semanticElements.clear();
  }

  /**
   * Update canvas dimensions
   * Called when canvas is resized
   */
  updateCanvasDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /**
   * Resolve a natural language target to bounding box coordinates
   * Implements 3-tier resolution strategy
   *
   * @param target - Natural language description (e.g., "numerator", "left side")
   * @returns Bounding box or null if resolution fails
   */
  resolve(target: string): AnnotationBounds | null {
    const normalizedTarget = target.toLowerCase().trim();

    // Tier 1: Fuzzy semantic ID matching
    const tier1Result = this.tier1_semanticMatch(normalizedTarget);
    if (tier1Result) {
      console.log(
        `[AnnotationResolver] Tier 1 success: "${target}" → semantic element`
      );
      return tier1Result;
    }

    // Tier 2: Predefined region matching
    const tier2Result = this.tier2_regionMatch(normalizedTarget);
    if (tier2Result) {
      console.log(
        `[AnnotationResolver] Tier 2 success: "${target}" → predefined region`
      );
      return tier2Result;
    }

    // Tier 3: Silent failure
    console.log(
      `[AnnotationResolver] Tier 3: Silent failure for "${target}" - no match found`
    );
    return null;
  }

  /**
   * Tier 1: Fuzzy semantic ID matching
   * Searches registered semantic elements for matches
   */
  private tier1_semanticMatch(target: string): AnnotationBounds | null {
    // Exact match first
    if (this.semanticElements.has(target)) {
      return this.semanticElements.get(target)!.bounds;
    }

    // Fuzzy match: check if target is contained in any semantic ID
    for (const [id, element] of this.semanticElements) {
      if (id.includes(target) || target.includes(id)) {
        return element.bounds;
      }
    }

    // No match found
    return null;
  }

  /**
   * Tier 2: Predefined region matching
   * Maps common natural language descriptions to canvas regions
   */
  private tier2_regionMatch(target: string): AnnotationBounds | null {
    const regions: Record<string, AnnotationBounds> = {
      // Directional regions
      "left side": {
        x: 0,
        y: 0,
        width: this.canvasWidth / 2,
        height: this.canvasHeight,
      },
      left: {
        x: 0,
        y: 0,
        width: this.canvasWidth / 2,
        height: this.canvasHeight,
      },
      "right side": {
        x: this.canvasWidth / 2,
        y: 0,
        width: this.canvasWidth / 2,
        height: this.canvasHeight,
      },
      right: {
        x: this.canvasWidth / 2,
        y: 0,
        width: this.canvasWidth / 2,
        height: this.canvasHeight,
      },
      "top half": {
        x: 0,
        y: 0,
        width: this.canvasWidth,
        height: this.canvasHeight / 2,
      },
      top: {
        x: 0,
        y: 0,
        width: this.canvasWidth,
        height: this.canvasHeight / 2,
      },
      "bottom half": {
        x: 0,
        y: this.canvasHeight / 2,
        width: this.canvasWidth,
        height: this.canvasHeight / 2,
      },
      bottom: {
        x: 0,
        y: this.canvasHeight / 2,
        width: this.canvasWidth,
        height: this.canvasHeight / 2,
      },

      // Common math terms (center regions with reasonable size)
      numerator: {
        x: this.canvasWidth / 3,
        y: this.canvasHeight / 4,
        width: this.canvasWidth / 3,
        height: this.canvasHeight / 6,
      },
      denominator: {
        x: this.canvasWidth / 3,
        y: (this.canvasHeight * 3) / 5,
        width: this.canvasWidth / 3,
        height: this.canvasHeight / 6,
      },
      "equals sign": {
        x: (this.canvasWidth * 2) / 5,
        y: (this.canvasHeight * 2) / 5,
        width: this.canvasWidth / 5,
        height: this.canvasHeight / 5,
      },
      equals: {
        x: (this.canvasWidth * 2) / 5,
        y: (this.canvasHeight * 2) / 5,
        width: this.canvasWidth / 5,
        height: this.canvasHeight / 5,
      },
      "first term": {
        x: this.canvasWidth / 6,
        y: this.canvasHeight / 3,
        width: this.canvasWidth / 4,
        height: this.canvasHeight / 3,
      },
      "second term": {
        x: (this.canvasWidth * 5) / 12,
        y: this.canvasHeight / 3,
        width: this.canvasWidth / 4,
        height: this.canvasHeight / 3,
      },
      "third term": {
        x: (this.canvasWidth * 2) / 3,
        y: this.canvasHeight / 3,
        width: this.canvasWidth / 4,
        height: this.canvasHeight / 3,
      },
    };

    return regions[target] || null;
  }
}

// Export singleton instance (can be reconfigured with updateCanvasDimensions)
export const annotationResolver = new AnnotationResolver();
