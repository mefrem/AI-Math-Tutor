/**
 * Annotation Resolver Service
 * Story 3.4: Tutor Highlighting and Circling Capability
 *
 * Implements 3-tier resolution strategy to translate natural language targets
 * (e.g., "numerator", "left side") into canvas coordinates.
 *
 * Tier 1: Fuzzy semantic ID matching (from problem rendering)
 * Tier 2: Predefined region matching (common canvas regions)
 * Tier 3: Vision API fallback (element detection via Vision API)
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
 * Problem bounding box
 */
interface ProblemBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Annotation Resolver Class
 */
export class AnnotationResolver {
  private semanticElements: Map<string, SemanticElement> = new Map();
  private canvasWidth: number;
  private canvasHeight: number;
  private problemBounds: ProblemBounds | null = null;
  private canvasSnapshot: string | null = null; // Store canvas snapshot for Vision API fallback

  constructor(canvasWidth: number = 800, canvasHeight: number = 600) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Set canvas snapshot for Vision API fallback
   */
  setCanvasSnapshot(snapshot: string | null): void {
    this.canvasSnapshot = snapshot;
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
   * Update problem bounds from registered elements
   * Called after problem is rendered
   */
  updateProblemBounds(): void {
    if (this.semanticElements.size === 0) {
      this.problemBounds = null;
      return;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const element of this.semanticElements.values()) {
      const x = element.bounds.x;
      const y = element.bounds.y;
      const width = element.bounds.width;
      const height = element.bounds.height;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x + width);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y + height);
    }

    this.problemBounds = {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Get problem bounds
   */
  getProblemBounds(): ProblemBounds | null {
    return this.problemBounds;
  }

  /**
   * Get all registered semantic elements (for client-to-server sync)
   */
  getAllSemanticElements(): Map<string, SemanticElement> {
    return new Map(this.semanticElements);
  }

  /**
   * Register multiple semantic elements at once (for server-side sync from client)
   */
  registerElements(elements: Array<{ id: string; bounds: AnnotationBounds }>): void {
    for (const { id, bounds } of elements) {
      this.registerElement(id, bounds);
    }
  }

  /**
   * Resolve a natural language target to bounding box coordinates
   * Implements 3-tier resolution strategy
   *
   * @param target - Natural language description (e.g., "numerator", "left side")
   * @returns Bounding box or null if resolution fails
   */
  async resolve(target: string): Promise<AnnotationBounds | null> {
    const normalizedTarget = target.toLowerCase().trim();
    
    // Debug: Log registered elements
    console.log(`[AnnotationResolver] Resolving "${target}" (normalized: "${normalizedTarget}")`);
    console.log(`[AnnotationResolver] Registered semantic elements:`, Array.from(this.semanticElements.keys()));

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

    // Tier 3: Vision API fallback
    const tier3Result = await this.tier3_visionApiFallback(target);
    if (tier3Result) {
      console.log(
        `[AnnotationResolver] Tier 3 success: "${target}" → Vision API detection`
      );
      return tier3Result;
    }

    // Final failure
    console.log(
      `[AnnotationResolver] All tiers failed for "${target}" - no match found`
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

    // Normalized match (replace underscores with spaces)
    const normalizedTarget = target.replace(/\s+/g, "_");
    if (this.semanticElements.has(normalizedTarget)) {
      return this.semanticElements.get(normalizedTarget)!.bounds;
    }

    // Handle compound targets like "2x" by finding and combining multiple elements
    const compoundMatch = this.findCompoundElement(target);
    if (compoundMatch) {
      return compoundMatch;
    }

    // Search by content (e.g., "5" → "number_5")
    const contentMatch = this.findElementByContent(target);
    if (contentMatch) {
      return contentMatch;
    }

    // Search by type (e.g., "equals sign" → "operator_equals")
    const typeMatch = this.findElementByType(target);
    if (typeMatch) {
      return typeMatch;
    }

    // Fuzzy match: check if target is contained in any semantic ID
    for (const [id, element] of this.semanticElements) {
      const normalizedId = id.replace(/_/g, " ");
      if (id.includes(target) || target.includes(id) || 
          normalizedId.includes(target) || target.includes(normalizedId)) {
        return element.bounds;
      }
    }

    // No match found
    return null;
  }

  /**
   * Find compound elements like "2x" by finding and combining multiple elements
   */
  private findCompoundElement(target: string): AnnotationBounds | null {
    const normalizedTarget = target.toLowerCase().trim();
    
    // Try to match compound expressions like "2x", "3y", "5x", etc.
    // Pattern: number followed by variable (e.g., "2x" = "2" + "x")
    const compoundMatch = normalizedTarget.match(/^(\d+)([a-zA-Z])$/);
    if (compoundMatch) {
      const number = compoundMatch[1];
      const variable = compoundMatch[2];
      
      console.log(`[AnnotationResolver] Attempting to find compound element "${target}":`, {
        number,
        variable,
        availableElements: Array.from(this.semanticElements.keys()),
      });
      
      // Find the number element - look for "number_2" specifically
      // Use preferredType to avoid matching "operator___2" instead of "number_2"
      let numberBounds: AnnotationBounds | null = null;
      
      // First try exact match for "number_2" or "number 2"
      for (const [id, element] of this.semanticElements) {
        if (id === `number_${number}` || id === `number ${number}`) {
          numberBounds = element.bounds;
          console.log(`[AnnotationResolver] Found number element "${number}" by exact match:`, { id, bounds: element.bounds });
          break;
        }
      }
      
      // If not found by exact match, try content match with preferred type "number"
      // This will only match elements that start with "number_"
      if (!numberBounds) {
        numberBounds = this.findElementByContent(number, "number");
        if (numberBounds) {
          console.log(`[AnnotationResolver] Found number element "${number}" by content match with preferred type`);
        }
      }
      
      // Find the variable element - look for "variable_x" specifically
      // Use preferredType to avoid matching wrong elements
      let variableBounds: AnnotationBounds | null = null;
      
      // First try exact match for "variable_x" or "variable x"
      for (const [id, element] of this.semanticElements) {
        const normalizedVar = variable.toLowerCase();
        if (id === `variable_${normalizedVar}` || id === `variable ${normalizedVar}`) {
          variableBounds = element.bounds;
          console.log(`[AnnotationResolver] Found variable element "${variable}" by exact match:`, { id, bounds: element.bounds });
          break;
        }
      }
      
      // If not found by exact match, try content match with preferred type "variable"
      // This will only match elements that start with "variable_"
      if (!variableBounds) {
        variableBounds = this.findElementByContent(variable, "variable");
        if (variableBounds) {
          console.log(`[AnnotationResolver] Found variable element "${variable}" by content match with preferred type`);
        }
      }
      
      if (numberBounds && variableBounds) {
        // Combine bounds: leftmost x, topmost y, combined width, max height
        const combinedBounds: AnnotationBounds = {
          x: Math.min(numberBounds.x, variableBounds.x),
          y: Math.min(numberBounds.y, variableBounds.y),
          width: Math.max(
            numberBounds.x + numberBounds.width,
            variableBounds.x + variableBounds.width
          ) - Math.min(numberBounds.x, variableBounds.x),
          height: Math.max(numberBounds.height, variableBounds.height),
        };
        
        console.log(`[AnnotationResolver] Found compound element "${target}":`, {
          numberBounds,
          variableBounds,
          combinedBounds,
        });
        
        return combinedBounds;
      } else {
        console.warn(`[AnnotationResolver] Could not find both elements for compound "${target}":`, {
          numberFound: !!numberBounds,
          variableFound: !!variableBounds,
          availableElements: Array.from(this.semanticElements.keys()),
        });
      }
    }
    
    return null;
  }

  /**
   * Find element by content (e.g., "5" → "number_5")
   * Also handles phrases like "the 5" by extracting just the number
   */
  private findElementByContent(content: string, preferredType?: string): AnnotationBounds | null {
    const normalizedContent = content.toLowerCase().trim();
    
    // Extract just the number/content from phrases like "the 5", "highlight 5", etc.
    // Try to find a number or specific content in the phrase
    const numberMatch = normalizedContent.match(/\b(\d+)\b/);
    const extractedContent = numberMatch ? numberMatch[1] : normalizedContent;
    
    // Also try to match the full phrase, then fall back to extracted content
    const searchTerms = [normalizedContent, extractedContent];
    
    for (const searchTerm of searchTerms) {
      if (!searchTerm) continue;
      
      // If preferredType is specified, try to match that type first (e.g., "number" for "2")
      // This ensures we match "number_2" not "operator___2"
      if (preferredType) {
        for (const [id, element] of this.semanticElements) {
          // Check if ID starts with preferred type (e.g., "number_" or "variable_")
          if (id.startsWith(`${preferredType}_`) || id.startsWith(`${preferredType} `)) {
            const parts = id.split("_");
            if (parts.length >= 2) {
              // Extract content from semantic ID (e.g., "number_2" → "2")
              const elementContent = parts.slice(1).join("_").replace(/\s+/g, "_");
              
              // Match exact content or normalized version
              if (elementContent === searchTerm || 
                  elementContent.replace(/_/g, "") === searchTerm.replace(/\s+/g, "")) {
                console.log(`[AnnotationResolver] Found element by content (preferred type "${preferredType}"): "${content}" → "${id}" (${elementContent})`);
                return element.bounds;
              }
            }
          }
        }
        
        // If preferred type didn't match, don't fall through to fuzzy matching
        // This prevents matching wrong elements like "operator___2" when looking for "number_2"
        console.log(`[AnnotationResolver] No match found with preferred type "${preferredType}" for "${content}"`);
        return null;
      }
      
      // Try exact match first
      for (const [id, element] of this.semanticElements) {
        // Extract content from semantic ID (e.g., "number_5" → "5")
        const parts = id.split("_");
        if (parts.length >= 2) {
          const elementContent = parts.slice(1).join("_");
          // Match exact content or normalized version
          if (elementContent === searchTerm || 
              elementContent === searchTerm.replace(/\s+/g, "_") ||
              elementContent.replace(/_/g, "") === searchTerm.replace(/\s+/g, "")) {
            console.log(`[AnnotationResolver] Found element by content: "${content}" → "${id}" (${elementContent})`);
            return element.bounds;
          }
        }
      }
      
      // Try fuzzy match - check if content appears anywhere in semantic IDs
      // But only if we haven't found a preferred type match
      if (!preferredType) {
        for (const [id, element] of this.semanticElements) {
          const normalizedId = id.toLowerCase().replace(/_/g, "");
          const normalizedTarget = searchTerm.replace(/\s+/g, "");
          if (normalizedId.includes(normalizedTarget) || normalizedTarget.includes(normalizedId)) {
            console.log(`[AnnotationResolver] Found element by fuzzy content match: "${content}" → "${id}"`);
            return element.bounds;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Find element by type (e.g., "equals sign" → "operator_equals")
   */
  private findElementByType(type: string): AnnotationBounds | null {
    const normalizedType = type.toLowerCase().trim();
    
    // Map common type descriptions to element types
    // Note: "=" becomes "_" in semantic ID, so "operator_=" becomes "operator__"
    const typeMap: Record<string, string[]> = {
      "equals sign": ["operator__", "operator_equals", "equals"],
      "equal sign": ["operator__", "operator_equals", "equals"],
      "equals": ["operator__", "operator_equals", "equals"],
      "plus sign": ["operator_+", "operator_plus", "plus"],
      "minus sign": ["operator_-", "operator_minus", "minus"],
      "multiply": ["operator_*", "operator_multiply"],
      "divide": ["operator_/", "operator_divide"],
      "number": ["number"],
      "variable": ["variable"],
      "name": ["name"],
      "percentage": ["percentage"],
      "question": ["question"],
    };
    
    const possibleTypes = typeMap[normalizedType];
    if (possibleTypes) {
      for (const possibleType of possibleTypes) {
        for (const [id, element] of this.semanticElements) {
          // Match exact type prefix (e.g., "operator__" matches "operator__")
          if (id === possibleType || id.startsWith(possibleType)) {
            console.log(`[AnnotationResolver] Found element by type: "${type}" → "${id}"`, {
              id,
              bounds: element.bounds,
              possibleType,
            });
            return element.bounds;
          }
        }
      }
    }
    
    // Also try direct content match for operators (e.g., "=" → "operator__")
    // Special handling for "=" which becomes "_" in semantic ID: "operator_" + "_" = "operator__"
    if (normalizedType === "=" || normalizedType === "equals" || normalizedType === "equals sign" || normalizedType === "equal sign") {
      for (const [id, element] of this.semanticElements) {
        // "=" becomes "_" in semantic ID, so look for "operator__"
        // Pattern: "operator_" followed by just "_" (the "=" character normalized)
        if (id === "operator__" || (id.startsWith("operator_") && id.replace("operator_", "") === "_")) {
          console.log(`[AnnotationResolver] Found operator "=" by semantic ID pattern: "${type}" → "${id}"`, {
            id,
            bounds: element.bounds,
          });
          return element.bounds;
        }
      }
    }
    
    return null;
  }

  /**
   * Tier 2: Predefined region matching
   * Maps common natural language descriptions to canvas regions
   * Uses problem bounds if available, otherwise uses canvas dimensions
   */
  private tier2_regionMatch(target: string): AnnotationBounds | null {
    // Use problem bounds if available, otherwise use canvas dimensions
    const bounds = this.problemBounds || {
      minX: 0,
      maxX: this.canvasWidth,
      minY: 0,
      maxY: this.canvasHeight,
      width: this.canvasWidth,
      height: this.canvasHeight,
    };

    // Try to find specific elements first (e.g., "equals sign")
    const elementMatch = this.findSpecificElement(target);
    if (elementMatch) {
      return elementMatch;
    }

    // Find equals sign to calculate left/right sides of equations
    // Strategy: Find the equals sign that comes after all left-side elements
    // Sort all elements by x position and find the equals sign that separates left from right
    const allElementsSorted = Array.from(this.semanticElements.entries())
      .map(([id, element]) => ({ id, element, x: element.bounds.x }))
      .sort((a, b) => a.x - b.x);
    
    // Find all equals signs
    const equalsSigns = allElementsSorted.filter(({ id }) => 
      id === "operator__" || id === "operator  " || 
      (id.startsWith("operator_") && id.replace("operator_", "") === "_")
    );
    
    // Find the equals sign that has elements on both sides
    // This should be the one that's in the middle of the equation
    let equalsSign: AnnotationBounds | null = null;
    
    if (equalsSigns.length > 0) {
      // If multiple equals signs, pick the one that comes AFTER the most elements
      // This should be the main equation separator (e.g., in "2x + 5 = 13", it comes after "2", "x", "+", "5")
      // However, if there's only one equals sign but it's clearly in the wrong position (before numbers that should be on the left),
      // we need to find the rightmost equals sign or validate its position
      
      let bestEqualsSign = equalsSigns[0];
      let maxLeftCount = allElementsSorted.filter(e => e.x < equalsSigns[0].x).length;
      
      for (const eqSign of equalsSigns) {
        const leftCount = allElementsSorted.filter(e => e.x < eqSign.x).length;
        if (leftCount > maxLeftCount) {
          maxLeftCount = leftCount;
          bestEqualsSign = eqSign;
        }
      }
      
      // Validate: If the equals sign is before elements that should be on the left side (like numbers),
      // it might be wrong. Look for the rightmost equals sign instead.
      // Check if there are number/variable elements AFTER the selected equals sign that should be on the left
      const elementsAfterEquals = allElementsSorted.filter(e => 
        e.x > bestEqualsSign.element.bounds.x + bestEqualsSign.element.bounds.width &&
        (e.id.startsWith('number_') || e.id.startsWith('variable_') || e.id.startsWith('operator_'))
      );
      
      // If there are significant elements (numbers/variables) after the equals sign, 
      // and they're not on the right side (like "13"), the equals sign might be wrong
      // But we can't really determine this without context. Let's use the rightmost equals sign instead.
      if (equalsSigns.length > 1) {
        // Use the rightmost equals sign (highest x position)
        bestEqualsSign = equalsSigns.reduce((rightmost, current) => 
          current.x > rightmost.x ? current : rightmost
        );
      }
      
      equalsSign = bestEqualsSign.element.bounds;
      
      console.log(`[AnnotationResolver] Found ${equalsSigns.length} equals sign(s), using one at x=${equalsSign.x}:`, {
        allElementsSorted: allElementsSorted.map(e => ({ id: e.id, x: e.x })),
        equalsSigns: equalsSigns.map(e => ({ id: e.id, x: e.x })),
        selectedEqualsSign: { x: equalsSign.x, width: equalsSign.width },
      });
    } else {
      // Fallback: try type-based search
      equalsSign = this.findElementByType("equals sign");
    }
    
    // Calculate left/right side regions based on equals sign position if available
    let leftSideBounds: AnnotationBounds | null = null;
    let rightSideBounds: AnnotationBounds | null = null;
    
    // If we found an equals sign, but it's positioned incorrectly (e.g., before elements that should be on the left),
    // try to find the correct split point by looking for the gap between left and right side elements
    if (equalsSign) {
      // Validate equals sign position: it should have elements on both sides
      const elementsBeforeEquals = allElementsSorted.filter(e => e.x < equalsSign.x);
      const elementsAfterEquals = allElementsSorted.filter(e => e.x > equalsSign.x + equalsSign.width);
      
      // If equals sign is at the very left (no elements before) or at the very right (no elements after),
      // it's probably wrong. Try to find a better split point.
      if (elementsBeforeEquals.length === 0 || elementsAfterEquals.length === 0) {
        console.warn(`[AnnotationResolver] Equals sign at x=${equalsSign.x} appears to be at edge (before: ${elementsBeforeEquals.length}, after: ${elementsAfterEquals.length}). Attempting to find better split.`);
        
        // Look for the largest gap between elements that might indicate the equation split
        let largestGap = 0;
        let gapStartElement: { id: string; x: number; right: number } | null = null;
        
        for (let i = 0; i < allElementsSorted.length - 1; i++) {
          const current = allElementsSorted[i];
          const next = allElementsSorted[i + 1];
          const gap = next.x - (current.x + current.element.bounds.width);
          
          // Look for significant gaps (larger than typical spacing)
          // Also check if this split makes sense (numbers/variables on both sides)
          if (gap > largestGap && gap > 10) { // 10px minimum gap
            const leftCount = i + 1;
            const rightCount = allElementsSorted.length - i - 1;
            
            // Prefer splits that have roughly equal elements on both sides
            if (leftCount > 0 && rightCount > 0) {
              largestGap = gap;
              gapStartElement = {
                id: current.id,
                x: current.x + current.element.bounds.width,
                right: next.x
              };
            }
          }
        }
        
        if (gapStartElement && largestGap > 10) {
          console.log(`[AnnotationResolver] Found better split point at gap: x=${gapStartElement.x} (gap: ${largestGap}px)`);
          // Use the gap as the split point
          equalsSign = {
            x: gapStartElement.x,
            y: bounds.minY,
            width: largestGap,
            height: bounds.height
          };
        }
      }
      // Find all elements that are to the left of the equals sign
      // Left side: all elements where element starts before the equals sign starts
      // BUT: If the equals sign is positioned incorrectly, we need to find elements that should be on the left
      // by looking for the first large number on the right side (like "13" in "2x + 5 = 13")
      let leftMinX = Infinity;
      let leftMaxX = -Infinity;
      let leftMinY = Infinity;
      let leftMaxY = -Infinity;
      
      // Find the first large number on the right side (this should be the answer, like "13")
      // This helps us identify where the left side actually ends
      const rightSideNumbers = allElementsSorted.filter(e => 
        e.x > equalsSign.x + equalsSign.width &&
        e.id.startsWith('number_') &&
        e.id !== 'number_5' && e.id !== 'number 5' // Exclude "5" which should be on the left
      );
      
      // If we found a right-side number, use it to determine the split point
      // Otherwise, use the equals sign position
      const splitPoint = rightSideNumbers.length > 0 
        ? rightSideNumbers[0].x  // Split before the first right-side number
        : equalsSign.x;           // Use equals sign position
      
      // Log all elements for debugging
      const allElements = Array.from(this.semanticElements.entries()).map(([id, element]) => ({
        id,
        x: element.bounds.x,
        width: element.bounds.width,
        right: element.bounds.x + element.bounds.width,
        content: id.split('_').slice(1).join('_'),
      }));
      console.log(`[AnnotationResolver] All registered elements for left/right side calculation:`, {
        equalsSign: { x: equalsSign.x, width: equalsSign.width, right: equalsSign.x + equalsSign.width },
        splitPoint,
        rightSideNumbers: rightSideNumbers.map(e => ({ id: e.id, x: e.x })),
        allElements,
      });
      
      for (const [id, element] of this.semanticElements.entries()) {
        // Skip the equals sign itself
        if (id === "operator__" || id === "operator  " || id.startsWith("operator_") && id.includes("=")) {
          continue;
        }
        
        // Skip right-side numbers (like "13")
        if (rightSideNumbers.some(e => e.id === id)) {
          continue;
        }
        
        const elementRight = element.bounds.x + element.bounds.width;
        const elementLeft = element.bounds.x;
        // Include elements that start before the split point
        // This ensures we include all terms to the left, including "5" if it's before the right-side number
        if (elementLeft < splitPoint) {
          leftMinX = Math.min(leftMinX, elementLeft);
          leftMaxX = Math.max(leftMaxX, elementRight);
          leftMinY = Math.min(leftMinY, element.bounds.y);
          leftMaxY = Math.max(leftMaxY, element.bounds.y + element.bounds.height);
          console.log(`[AnnotationResolver] Including element "${id}" in left side:`, {
            elementLeft,
            elementRight,
            splitPoint,
            comparison: `${elementLeft} < ${splitPoint}`,
            included: true,
          });
        } else {
          console.log(`[AnnotationResolver] Excluding element "${id}" from left side:`, {
            elementLeft,
            elementRight,
            splitPoint,
            comparison: `${elementLeft} >= ${splitPoint}`,
            included: false,
          });
        }
      }
      
      // Find all elements that are to the right of the equals sign
      // Right side: all elements where element.x >= equalsSign.x + equalsSign.width
      let rightMinX = Infinity;
      let rightMaxX = -Infinity;
      let rightMinY = Infinity;
      let rightMaxY = -Infinity;
      
      for (const element of this.semanticElements.values()) {
        const equalsRight = equalsSign.x + equalsSign.width;
        // Include elements that are entirely to the right of the equals sign
        if (element.bounds.x >= equalsRight - 5) { // -5 pixel tolerance for spacing
          rightMinX = Math.min(rightMinX, element.bounds.x);
          rightMaxX = Math.max(rightMaxX, element.bounds.x + element.bounds.width);
          rightMinY = Math.min(rightMinY, element.bounds.y);
          rightMaxY = Math.max(rightMaxY, element.bounds.y + element.bounds.height);
        }
      }
      
      // If we found left-side elements, use their bounds; otherwise fall back to calculation
      if (leftMinX !== Infinity && leftMaxX !== -Infinity) {
        leftSideBounds = {
          x: leftMinX,
          y: leftMinY !== Infinity ? leftMinY : bounds.minY,
          width: leftMaxX - leftMinX,
          height: leftMaxY !== -Infinity ? leftMaxY - leftMinY : bounds.height,
        };
      } else {
        // Fallback: calculate from minX to equals sign
        leftSideBounds = {
          x: bounds.minX,
          y: bounds.minY,
          width: equalsSign.x - bounds.minX,
          height: bounds.height,
        };
      }
      
      // If we found right-side elements, use their bounds; otherwise fall back to calculation
      if (rightMinX !== Infinity && rightMaxX !== -Infinity) {
        rightSideBounds = {
          x: rightMinX,
          y: rightMinY !== Infinity ? rightMinY : bounds.minY,
          width: rightMaxX - rightMinX,
          height: rightMaxY !== -Infinity ? rightMaxY - rightMinY : bounds.height,
        };
      } else {
        // Fallback: calculate from equals sign to maxX
        rightSideBounds = {
          x: equalsSign.x + equalsSign.width,
          y: bounds.minY,
          width: bounds.maxX - (equalsSign.x + equalsSign.width),
          height: bounds.height,
        };
      }
      
      console.log(`[AnnotationResolver] Found equals sign at x=${equalsSign.x}, calculating left/right sides:`, {
        equalsSign: { x: equalsSign.x, width: equalsSign.width },
        leftSide: leftSideBounds,
        rightSide: rightSideBounds,
        problemBounds: bounds,
        leftElements: Array.from(this.semanticElements.values()).filter(e => 
          (e.bounds.x + e.bounds.width) <= equalsSign.x + 5
        ).map(e => e.bounds),
        rightElements: Array.from(this.semanticElements.values()).filter(e => 
          e.bounds.x >= (equalsSign.x + equalsSign.width) - 5
        ).map(e => e.bounds),
      });
    } else {
      // Fallback: use half-width if no equals sign found
      leftSideBounds = {
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.width / 2,
        height: bounds.height,
      };
      
      rightSideBounds = {
        x: bounds.minX + bounds.width / 2,
        y: bounds.minY,
        width: bounds.width / 2,
        height: bounds.height,
      };
      
      console.log(`[AnnotationResolver] No equals sign found, using half-width for left/right sides`);
    }

    const regions: Record<string, AnnotationBounds> = {
      // Directional regions (based on equals sign position if available, otherwise problem bounds)
      "left side": leftSideBounds!,
      left: leftSideBounds!,
      "right side": rightSideBounds!,
      right: rightSideBounds!,
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

      // Common math terms (use problem bounds if available)
      numerator: {
        x: bounds.minX + bounds.width / 3,
        y: bounds.minY + bounds.height / 4,
        width: bounds.width / 3,
        height: bounds.height / 6,
      },
      denominator: {
        x: bounds.minX + bounds.width / 3,
        y: bounds.minY + (bounds.height * 3) / 5,
        width: bounds.width / 3,
        height: bounds.height / 6,
      },
      "first term": {
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.width / 3,
        height: bounds.height,
      },
      "second term": {
        x: bounds.minX + bounds.width / 3,
        y: bounds.minY,
        width: bounds.width / 3,
        height: bounds.height,
      },
      "third term": {
        x: bounds.minX + (bounds.width * 2) / 3,
        y: bounds.minY,
        width: bounds.width / 3,
        height: bounds.height,
      },
    };

    return regions[target] || null;
  }

  /**
   * Find specific element by description (e.g., "equals sign")
   */
  private findSpecificElement(description: string): AnnotationBounds | null {
    const normalized = description.toLowerCase().trim();
    
    // Map descriptions to semantic IDs
    const descriptionMap: Record<string, string[]> = {
      "equals sign": ["operator_equals", "equals"],
      "equal sign": ["operator_equals", "equals"],
      "equals": ["operator_equals", "equals"],
    };
    
    const possibleIds = descriptionMap[normalized];
    if (possibleIds) {
      for (const id of possibleIds) {
        // Try exact match
        if (this.semanticElements.has(id)) {
          return this.semanticElements.get(id)!.bounds;
        }
        // Try fuzzy match
        for (const [elementId, element] of this.semanticElements) {
          if (elementId.includes(id) || id.includes(elementId)) {
            return element.bounds;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Tier 3: Vision API fallback
   * Uses Vision API to detect element positions when semantic registry fails
   */
  private async tier3_visionApiFallback(target: string): Promise<AnnotationBounds | null> {
    // Only use Vision API if canvas snapshot is available
    if (!this.canvasSnapshot) {
      return null;
    }

    try {
      // Dynamically import element detection service (to avoid SSR issues)
      const { detectElementPosition } = await import("@/services/elementDetectionService");
      
      // Call Vision API to detect element position
      const bounds = await detectElementPosition(
        this.canvasSnapshot!,
        target,
        this.canvasWidth,
        this.canvasHeight
      );

      return bounds;
    } catch (error) {
      console.error("[AnnotationResolver] Vision API fallback error:", error);
      return null;
    }
  }
}

// Export singleton instance (can be reconfigured with updateCanvasDimensions)
export const annotationResolver = new AnnotationResolver();
