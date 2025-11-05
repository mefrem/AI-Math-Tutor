# Improved Annotation Strategies

## Current Issues

1. **Hardcoded Coordinates**: Tier 2 predefined regions use fixed coordinates that don't match actual problem positions
   - "equals sign": `x = canvasWidth * 2/5` (hardcoded, doesn't match actual "=" position)
   - "left side": Highlights entire left half of canvas (too broad)
   - Coordinates don't account for text centering or paragraph breaks

2. **No Text Element Tracking**: Plain text elements (numbers, variables) aren't tracked for annotation
   - Only fractions, exponents, square roots get semantic IDs
   - Numbers like "5", "13" can't be annotated

3. **Vision API Not Used for Annotation**: Tutor can see the whiteboard but we don't use Vision API to locate elements
   - Vision API could identify exact positions of elements
   - Could use OCR-style detection for specific numbers/words

## Proposed Solutions

### Option A: Vision API-Based Element Detection (Recommended)

**Approach**: Use GPT-4o Vision API to analyze the canvas snapshot and identify element positions

**How it works:**
1. When tutor requests annotation, send canvas snapshot to Vision API
2. Ask Vision API to identify bounding box of target element
3. Vision API returns coordinates
4. Use those coordinates for annotation

**Pros:**
- Works for any element (numbers, words, symbols)
- Accurate positioning regardless of text centering
- No need to track all elements manually
- Works with student drawings too

**Cons:**
- Additional API call (latency)
- Cost (Vision API usage)
- May not be 100% accurate

**Implementation:**
- Add `detectElement` function that uses Vision API
- Prompts Vision API: "Find the bounding box of [target] in this image"
- Returns coordinates for annotation

### Option B: Enhanced Semantic Registry with Text Element Tracking

**Approach**: Register ALL text elements (not just math expressions) with their positions

**How it works:**
1. When rendering problem, track every text segment with its bounds
2. Register each number, variable, operator separately
3. Store in semantic registry with IDs like "number_5", "variable_x", "operator_equals"
4. Annotation resolver can match "5" to "number_5" element

**Pros:**
- Fast (no API call needed)
- Accurate (uses actual rendered positions)
- Works for all elements

**Cons:**
- More complex rendering logic
- Need to track all elements during render
- Coordinate calculations need to account for centering

**Implementation:**
- Update `problemRenderer.ts` to track all text segments
- Register each segment with semantic ID
- Update annotation resolver to match text content

### Option C: OCR-Style Pattern Matching

**Approach**: Parse rendered text to find exact positions of numbers/words

**How it works:**
1. When problem is rendered, create a text position map
2. Map each character/word to its canvas coordinates
3. Annotation resolver searches text map for target
4. Returns coordinates of matching text

**Pros:**
- Fast and accurate
- Works for any text element
- No external API calls

**Cons:**
- Complex to implement
- Need to track text rendering precisely
- May not work well with wrapped text

**Implementation:**
- Create `TextPositionMap` class
- Track character positions during rendering
- Fuzzy matching for text content

### Option D: Hybrid Approach (Recommended)

**Approach**: Combine multiple strategies

1. **Tier 1 (Enhanced)**: Track all rendered elements (text, math, everything)
   - Register numbers, variables, operators with semantic IDs
   - Use actual rendered positions

2. **Tier 2 (Improved)**: Use actual problem bounds for regions
   - "left side" = left half of problem area, not entire canvas
   - "equals sign" = find actual "=" position in rendered elements
   - Calculate regions based on actual problem position

3. **Tier 3 (Vision API Fallback)**: If Tier 1 & 2 fail, use Vision API
   - Send canvas snapshot to Vision API
   - Ask: "Find the bounding box of [target]"
   - Use returned coordinates

**Pros:**
- Fast for common cases (Tier 1 & 2)
- Accurate fallback (Tier 3 Vision API)
- Works for any element

**Cons:**
- More complex implementation
- Vision API cost for fallback cases

## Recommended Implementation Plan

### Phase 1: Fix Coordinate Issues (Immediate)
- Update Tier 2 regions to use actual problem bounds
- Calculate "left side" based on problem area, not entire canvas
- Find actual "=" position in rendered elements

### Phase 2: Enhanced Element Tracking (Short-term)
- Register all text elements (numbers, variables, operators)
- Track positions accounting for centering
- Update annotation resolver to match text content

### Phase 3: Vision API Integration (Long-term)
- Add Vision API fallback for unmatchable elements
- Use Vision API to detect element positions when semantic registry fails
- Cache Vision API results for common elements

## Specific Fixes for Current Issues

### Issue 1: "equals sign" highlighting wrong location
**Fix**: Find actual "=" character position in rendered elements
- Search rendered elements for "=" character
- Use its actual position and size
- Account for centering

### Issue 2: "left side" highlighting entire canvas
**Fix**: Calculate left side based on problem bounds
- Find problem's bounding box (min/max x/y of all elements)
- "left side" = left half of problem area
- Not entire canvas left half

### Issue 3: Can't highlight specific numbers like "5"
**Fix**: Register all text elements
- Track each number, variable, operator separately
- Store with semantic IDs like "number_5", "variable_x"
- Match annotation requests to registered elements

