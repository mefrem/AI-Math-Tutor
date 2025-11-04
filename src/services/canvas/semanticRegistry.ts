/**
 * Semantic Registry Service
 * Manages semantic IDs for canvas elements (e.g., numerator, denominator, equals sign)
 * Used for tutor annotations (Story 3.4)
 */

import type { SemanticRegistry, Position, Dimensions } from "@/types/models";

/**
 * Semantic Registry class
 */
class SemanticRegistryService {
  private registry: SemanticRegistry = {};

  /**
   * Register a semantic element
   */
  register(
    semanticId: string,
    position: Position,
    size: Dimensions,
    label: string
  ): void {
    this.registry[semanticId] = {
      position,
      size,
      label,
    };
  }

  /**
   * Get semantic element by ID
   */
  get(
    semanticId: string
  ): { position: Position; size: Dimensions; label: string } | undefined {
    return this.registry[semanticId];
  }

  /**
   * Get all semantic elements
   */
  getAll(): SemanticRegistry {
    return { ...this.registry };
  }

  /**
   * Clear all semantic elements
   */
  clear(): void {
    this.registry = {};
  }

  /**
   * Check if semantic ID exists
   */
  has(semanticId: string): boolean {
    return semanticId in this.registry;
  }
}

// Export singleton instance
export const semanticRegistry = new SemanticRegistryService();
