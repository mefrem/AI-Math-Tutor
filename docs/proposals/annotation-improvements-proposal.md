# Annotation Accuracy Improvements - Proposal

## Current Issues Analysis

### Issue 1: "equals sign" highlighting wrong location
**Problem**: Tier 2 uses hardcoded coordinates that don't match actual "=" position
- Hardcoded: `x = canvasWidth * 2/5` (assumes fixed layout)
- After text centering, "=" is in different position
- Fixed position doesn't account for problem layout

**Root Cause**: Hardcoded coordinates in `annotationResolver.ts` Tier 2 regions

### Issue 2: "left side" highlighting entire canvas
**Problem**: Highlights entire left half of canvas, not problem area
- Current: `width: canvasWidth / 2` (entire canvas)
- Should be: left half of **problem area** only
- After centering, problem is in center, so "left side" of canvas is empty space

**Root Cause**: Tier 2 regions use canvas dimensions, not problem bounds

### Issue 3: Can't highlight specific numbers like "5"
**Problem**: Plain text elements aren't tracked for annotation
- Only fractions, exponents, square roots get semantic IDs
- Numbers, variables, operators aren't registered
- No way to annotate individual text elements

**Root Cause**: `problemRenderer.ts` only tracks math expressions, not all text

### Issue 4: Text centering broke coordinate references
**Problem**: Centering changes moved elements, but hardcoded coordinates didn't update
- Before: Fixed left-aligned positions
- After: Centered positions
- Hardcoded coordinates still use old assumptions

**Root Cause**: Tier 2 regions use fixed calculations, not actual element positions

## Proposed Solutions

### Solution A: Track All Text Elements (Recommended - Fastest)

**Approach**: Register every text element (numbers, variables, operators) with semantic IDs and actual positions

**Implementation**:
1. Update `problemRenderer.ts` to track all text segments separately
2. Register each segment with semantic ID: `number_5`, `variable_x`, `operator_equals`, `operator_plus`
3. Store actual rendered positions (accounting for centering)
4. Update annotation resolver to match text content

**Changes Needed**:
- Modify `problemRenderer.ts` to break text into individual elements
- Register each element with semantic ID
- Store positions in annotation resolver

**Pros**:
- Fast (no API calls)
- Accurate (uses actual rendered positions)
- Works for any text element
- Accounts for centering/paragraph breaks

**Cons**:
- More complex rendering logic
- Need to track all elements during render

**Example Registration**:
- Problem: "2x + 5 = 13"
- Registered elements:
  - `number_2`: {x: 200, y: 40, width: 15, height: 24}
  - `variable_x`: {x: 215, y: 40, width: 12, height: 24}
  - `operator_plus`: {x: 230, y: 40, width: 10, height: 24}
  - `number_5`: {x: 245, y: 40, width: 15, height: 24}
  - `operator_equals`: {x: 265, y: 40, width: 20, height: 24}
  - `number_13`: {x: 290, y: 40, width: 30, height: 24}

**Annotation Matching**:
- Request: "highlight the number 5"
- Resolver finds: `number_5` → uses its actual position
- Request: "highlight the equals sign"
- Resolver finds: `operator_equals` → uses its actual position

### Solution B: Calculate Regions from Actual Problem Bounds

**Approach**: Compute regions based on actual problem element positions, not hardcoded coordinates

**Implementation**:
1. Calculate problem bounding box (min/max x/y of all rendered elements)
2. Update Tier 2 regions to use problem bounds:
   - "left side" = left half of problem area (not entire canvas)
   - "equals sign" = find actual "=" element position
   - "first term" = first element's position
3. Account for centering in calculations

**Changes Needed**:
- Pass problem bounds to annotation resolver
- Update Tier 2 region calculations to use problem bounds
- Find actual element positions instead of hardcoding

**Pros**:
- More accurate than hardcoded positions
- Adapts to problem layout
- Works with centering/paragraph breaks
- Quick fix for region-based annotations

**Cons**:
- Still needs element tracking for specific elements
- May not work for all cases

**Example**:
- Problem: "2x + 5 = 13" (centered, wrapped)
- Problem bounds: `{minX: 200, maxX: 600, minY: 40, maxY: 100}`
- "left side" = `{x: 200, y: 40, width: 200, height: 60}` (left half of problem area)
- "equals sign" = find actual "=" element → `{x: 265, y: 40, width: 20, height: 24}`

### Solution C: Vision API Fallback

**Approach**: Use GPT-4o Vision API to detect element positions when semantic registry fails

**Implementation**:
1. Add `detectElementPosition` function that uses Vision API
2. If Tier 1 & 2 fail, send canvas snapshot to Vision API
3. Prompt: "Find the bounding box of [target] in this image. Return coordinates as JSON: {x, y, width, height}"
4. Parse response and use coordinates for annotation

**Changes Needed**:
- Create Vision API service for element detection
- Add fallback logic in annotation resolver
- Cache results for common elements

**Pros**:
- Works for any element (even student drawings)
- Accurate positioning
- No need to track all elements manually
- Handles edge cases

**Cons**:
- Additional API call (latency ~500ms-1s)
- Cost (Vision API usage)
- May not be 100% accurate
- Requires parsing Vision API response

**Example**:
- Request: "highlight the number 5"
- Tier 1 & 2 fail → Tier 3 Vision API
- Send canvas snapshot to Vision API
- Prompt: "Find the bounding box of '5' in this image"
- Vision API returns: `{x: 245, y: 40, width: 15, height: 24}`
- Use coordinates for annotation

### Solution D: Hybrid Approach (Recommended)

**Approach**: Combine Solutions A, B, and C for best results

**Implementation**:
1. **Tier 1 (Enhanced)**: Track all text elements with semantic IDs
   - Register numbers, variables, operators separately
   - Use actual rendered positions

2. **Tier 2 (Improved)**: Calculate regions from problem bounds
   - "left side" = left half of problem area
   - "equals sign" = find actual "=" element
   - "first term" = first element's position

3. **Tier 3 (Vision API Fallback)**: If Tier 1 & 2 fail, use Vision API
   - Send canvas snapshot to Vision API
   - Ask for element bounding box
   - Use returned coordinates

**Pros**:
- Fast for common cases (Tier 1 & 2)
- Accurate fallback (Tier 3)
- Works for any element
- Handles edge cases gracefully
- Best of all worlds

**Cons**:
- More complex implementation
- Vision API cost for fallback cases

## Implementation Priority

### Phase 1: Quick Fixes (Immediate - 1-2 hours)
1. Fix "left side" to use problem bounds, not entire canvas
2. Find actual "=" position in rendered elements
3. Calculate regions based on actual problem layout

**Impact**: Fixes Issues 1 & 2 immediately

### Phase 2: Enhanced Element Tracking (Short-term - 2-4 hours)
1. Register all text elements (numbers, variables, operators)
2. Track positions accounting for centering
3. Update annotation resolver to match text content

**Impact**: Fixes Issue 3, enables specific number highlighting

### Phase 3: Vision API Integration (Long-term - 4-6 hours)
1. Add Vision API fallback for unmatchable elements
2. Cache Vision API results for common elements
3. Optimize for performance

**Impact**: Handles edge cases, works for student drawings

## Specific Fixes

### Fix 1: "equals sign" Accuracy
- **Current**: Hardcoded `x = canvasWidth * 2/5`
- **Fix**: Search rendered elements for "=" character
- **Implementation**: Iterate through elements, find one with content "="
- **Result**: Use actual "=" position and size

### Fix 2: "left side" Scope
- **Current**: Entire left half of canvas
- **Fix**: Calculate problem bounding box, use left half of problem area
- **Implementation**: Find min/max x/y of all elements, calculate left half
- **Result**: Highlights only left side of problem, not empty canvas

### Fix 3: Specific Number Highlighting
- **Current**: Plain text not tracked
- **Fix**: Register all text elements with semantic IDs
- **Implementation**: Break text into individual elements, register each
- **Result**: Can annotate "5", "13", "2x", etc.

## Testing Strategy

### Test 1: "equals sign" Accuracy
- Problem: "2x + 5 = 13"
- Request: "highlight the equals sign"
- **Expected**: Orange highlight on "=" only
- **Check**: Annotation bounds match "=" element position

### Test 2: "left side" Scope
- Problem: "2x + 5 = 13" (centered)
- Request: "highlight the left side"
- **Expected**: Orange highlight on left half of problem area only
- **Check**: Annotation bounds match problem left half, not entire canvas

### Test 3: Specific Number Highlighting
- Problem: "2x + 5 = 13"
- Request: "highlight the number 5"
- **Expected**: Orange highlight on "5" only
- **Check**: Annotation bounds match "5" element position

### Test 4: Multiple Elements
- Problem: "2x + 5 = 13"
- Request: "highlight the 2x term"
- **Expected**: Orange highlight on "2x" only
- **Check**: Annotation bounds match "2x" elements

## Files to Modify

1. `src/services/canvas/problemRenderer.ts`
   - Track all text elements individually
   - Register each element with semantic ID
   - Store positions accounting for centering

2. `src/services/annotationResolver.ts`
   - Add method to get problem bounds from registered elements
   - Update Tier 2 regions to use problem bounds
   - Add element search for "equals sign", etc.

3. `src/components/whiteboard/Whiteboard.tsx`
   - Pass problem bounds to annotation resolver
   - Register all text elements with annotation resolver

4. `src/services/llmService.ts` (Optional - Phase 3)
   - Add Vision API fallback for element detection
   - Cache Vision API results
