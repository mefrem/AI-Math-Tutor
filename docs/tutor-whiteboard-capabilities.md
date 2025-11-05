# Tutor Whiteboard Capabilities - Current State & Testing Guide

## Current Functionality

### What the Tutor CAN Do:

1. **See the Whiteboard (Vision API)** ✅ **WORKING**
   - The tutor receives a canvas snapshot (base64 image) with every message
   - Uses GPT-4o Vision API to see:
     - The problem text (rendered on whiteboard)
     - Student drawings (blue lines/markings)
     - Any existing tutor annotations (orange highlights/circles)
   - **Status**: ✅ Confirmed working - tutor can see your drawings

2. **Annotate Elements (Highlight/Circle)** ⚠️ **PARTIALLY WORKING**
   - The tutor can call the `annotate_canvas` function to:
     - **Highlight** specific parts (orange highlight overlay)
     - **Circle** specific parts (orange circle overlay)
   - Maximum 3 annotations on screen at once
   - Uses 3-tier resolution strategy:
     - **Tier 1**: Semantic ID matching (fractions, exponents, square roots) - **Needs elements registered**
     - **Tier 2**: Predefined region matching (hardcoded coordinates) - **INACCURATE after centering**
     - **Tier 3**: Silent failure (graceful degradation)

### What the Tutor CANNOT Do:

- ❌ Draw on the whiteboard
- ❌ Erase student drawings
- ❌ Move elements around
- ❌ Edit the problem text
- ❌ Create new elements

## Current Issues

### Issue 1: "equals sign" highlighting wrong location
- **Problem**: Uses hardcoded coordinates: `x = canvasWidth * 2/5`
- **Root Cause**: Tier 2 predefined regions use fixed calculations that don't match actual element positions
- **Impact**: After text centering, "=" is in different position, so hardcoded coordinates are wrong

### Issue 2: "left side" highlighting entire canvas
- **Problem**: Highlights entire left half of canvas (`width: canvasWidth / 2`)
- **Root Cause**: Tier 2 regions use canvas dimensions, not problem bounds
- **Impact**: After centering, problem is in center, so "left side" of canvas is empty space

### Issue 3: Can't highlight specific numbers like "5"
- **Problem**: Plain text elements aren't tracked for annotation
- **Root Cause**: Only fractions, exponents, square roots get semantic IDs
- **Impact**: Numbers, variables, operators can't be annotated

### Issue 4: Text centering broke coordinate references
- **Problem**: Hardcoded coordinates assume fixed layout
- **Root Cause**: Tier 2 regions use fixed calculations that don't account for centering
- **Impact**: All hardcoded positions are now inaccurate

## How to Test Current Functionality

### Test 1: Vision API (Seeing Whiteboard) ✅
1. Draw something on the whiteboard (e.g., circle the number "13")
2. Send a message like "what did I just circle?"
3. **Expected**: Tutor should see the image and respond about what you circled
4. **Check logs**: `[LLM Service] Canvas snapshot check: useVision: true`
5. **Status**: ✅ Confirmed working

### Test 2: Semantic Element Annotation (Tier 1) ⚠️
1. Use a problem with fractions: "3/4 + 1/2"
2. Ask tutor to "highlight the numerator"
3. **Expected**: Orange highlight should appear on the numerator
4. **Check logs**: `[AnnotationResolver] Tier 1 success: "numerator" → semantic element`
5. **Status**: ⚠️ Should work now (after fix), but needs testing

### Test 3: Predefined Region Annotation (Tier 2) ❌
1. Use any problem: "2x + 5 = 13"
2. Ask tutor to "highlight the equals sign"
3. **Expected**: Orange highlight on "=" only
4. **Actual**: Highlights wrong location (hardcoded coordinates don't match)
5. **Status**: ❌ Inaccurate due to hardcoded coordinates

### Test 4: Predefined Region - "Left Side" ❌
1. Use problem: "2x + 5 = 13" (centered)
2. Ask tutor to "highlight the left side"
3. **Expected**: Orange highlight on left half of problem area
4. **Actual**: Highlights entire left half of canvas (too broad)
5. **Status**: ❌ Highlights entire canvas, not just problem area

### Test 5: Plain Text Annotation (Tier 3) ❌
1. Use problem: "2x + 5 = 13"
2. Ask tutor to "highlight the number 5"
3. **Expected**: Orange highlight on "5" only
4. **Actual**: Falls through to Tier 3 (silent failure)
5. **Status**: ❌ Not supported - plain text isn't tracked

## What Works vs. What Doesn't

| Target | Tier 1 | Tier 2 | Tier 3 | Status |
|--------|--------|--------|--------|--------|
| "numerator" (fraction) | ✅ | ✅ | N/A | ✅ Should work |
| "denominator" (fraction) | ✅ | ✅ | N/A | ✅ Should work |
| "left side" | ❌ | ❌ (wrong scope) | N/A | ❌ Highlights entire canvas |
| "equals sign" | ❌ | ❌ (wrong position) | N/A | ❌ Highlights wrong location |
| "5" (number) | ❌ | ❌ | ❌ | ❌ Not supported |
| "13" (number) | ❌ | ❌ | ❌ | ❌ Not supported |
| "2x" (term) | ❌ | ❌ | ❌ | ❌ Not supported |

## Proposed Solutions

See `docs/proposals/annotation-improvements-proposal.md` for detailed proposals.

### Quick Summary:

1. **Track All Text Elements** (Recommended)
   - Register every number, variable, operator separately
   - Store actual rendered positions
   - Enable annotation of any element

2. **Calculate Regions from Problem Bounds**
   - "left side" = left half of problem area (not entire canvas)
   - "equals sign" = find actual "=" element position
   - Use actual element positions, not hardcoded coordinates

3. **Vision API Fallback**
   - If semantic registry fails, use Vision API to detect element positions
   - Works for any element, even student drawings
   - Fallback for edge cases
