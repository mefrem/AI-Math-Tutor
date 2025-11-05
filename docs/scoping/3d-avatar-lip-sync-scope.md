# 3D Avatar with Realistic Mouth Movements - Implementation Scope

## Overview
This document outlines the scope, requirements, and implementation approach for upgrading the current 2D SVG avatar to a 3D avatar with realistic mouth movements synchronized with audio playback.

## Current State
- **Current Avatar**: Simple 2D SVG with basic lip-sync (mouth open/closed alternation)
- **Audio Integration**: TTS audio generation and playback working
- **Animation**: Basic mouth open/closed toggle every 150ms during audio playback

## Target State
- **3D Avatar**: Realistic 3D character with detailed facial features
- **Lip Sync**: Phoneme-based mouth movements synchronized with speech
- **Facial Expressions**: Support for emotions and expressions
- **Performance**: Smooth 60fps animation on modern browsers

## Technical Approach

### Option A: VRM Avatar with three-vrm (Recommended)
**Library**: `@pixiv/three-vrm` + `react-three-fiber`

**Pros:**
- Industry-standard VRM format (used in VRChat, VTubers)
- Extensive library of free/pre-made avatars available
- Built-in expression system (BlendShapes)
- Good documentation and community support
- Works well with React Three Fiber

**Cons:**
- Requires VRM model file (can create or download)
- Larger bundle size (~200-300KB for three-vrm)
- Need to implement phoneme-to-expression mapping

**Implementation Steps:**
1. Install dependencies: `three`, `@react-three/fiber`, `@pixiv/three-vrm`
2. Load VRM model (GLTF/VRM file)
3. Set up React Three Fiber Canvas
4. Implement phoneme-to-expression mapping
5. Sync expressions with audio playback
6. Handle idle animations and expressions

### Option B: Custom 3D Model with Three.js
**Library**: `three` + `@react-three/fiber`

**Pros:**
- Full control over avatar design
- Can optimize for specific use case
- Smaller bundle size if model is simple

**Cons:**
- Requires 3D modeling expertise or commissioned model
- Need to implement all animation systems from scratch
- More complex lip sync implementation

### Option C: Ready-made Avatar Library
**Libraries**: ReadyPlayerMe, Ready Set Go, or similar

**Pros:**
- Pre-built avatars with animation systems
- Often includes lip sync
- Less implementation work

**Cons:**
- May require API keys or subscriptions
- Less customization
- Potential vendor lock-in

## Recommended Approach: VRM Avatar (Option A)

### Dependencies Required

```json
{
  "dependencies": {
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@pixiv/three-vrm": "^1.0.0",
    "@react-three/drei": "^9.88.0"
  }
}
```

### Phoneme-to-Expression Mapping

**Phoneme Categories** (based on mouth shape):
- **A, E, I**: Open mouth positions
- **O, U**: Round mouth positions
- **M, B, P**: Closed mouth (lips together)
- **F, V**: Bottom lip on teeth
- **Th**: Tongue between teeth
- **Rest**: Neutral/closed mouth

**VRM Expression Presets** (available):
- `aa`, `ee`, `ih`, `oh`, `ou` (phoneme shapes)
- `happy`, `sad`, `angry`, `relaxed` (emotions)
- `blinkLeft`, `blinkRight` (eye animations)

### Implementation Components

1. **VRMAvatar Component** (`src/components/avatar/VRMAvatar.tsx`)
   - Load VRM model
   - Set up React Three Fiber scene
   - Handle expressions and animations

2. **LipSyncController** (`src/services/avatar/lipSyncController.ts`)
   - Parse audio/transcript to phonemes
   - Map phonemes to VRM expressions
   - Time expression changes with audio playback

3. **PhonemeParser** (`src/services/avatar/phonemeParser.ts`)
   - Convert text to phonemes
   - Time-align phonemes with audio
   - Generate expression timeline

4. **AvatarContext** (update `src/contexts/AudioContext.tsx`)
   - Add lip sync state
   - Manage expression timeline
   - Sync with audio playback

### Phoneme Detection Approaches

**Option 1: Text-to-Phoneme (Simpler)**
- Use library like `say` or `phoneme` to convert text to phonemes
- Time-align based on estimated phoneme duration
- Pros: Simple, no audio analysis needed
- Cons: Less accurate, may not match actual speech

**Option 2: Audio Analysis (More Accurate)**
- Use Web Audio API to analyze audio waveform
- Detect phonemes from audio characteristics
- Pros: More accurate, matches actual speech
- Cons: Complex, requires audio processing

**Option 3: Hybrid Approach (Recommended)**
- Use text-to-phoneme for initial mapping
- Refine with audio timing cues
- Pros: Good balance of accuracy and simplicity
- Cons: Moderate complexity

### Implementation Timeline Estimate

**Phase 1: Basic 3D Avatar (1-2 weeks)**
- Set up React Three Fiber
- Load and display VRM model
- Basic positioning and lighting
- Replace 2D avatar component

**Phase 2: Basic Lip Sync (1-2 weeks)**
- Implement text-to-phoneme conversion
- Map phonemes to VRM expressions
- Basic synchronization with audio
- Test with various texts

**Phase 3: Enhanced Lip Sync (1 week)**
- Improve phoneme timing
- Add transition smoothing
- Handle edge cases (silence, pauses)
- Optimize performance

**Phase 4: Polish & Testing (1 week)**
- Add idle animations
- Facial expressions for emotions
- Performance optimization
- Cross-browser testing

**Total Estimated Time: 4-6 weeks**

### File Structure

```
src/
├── components/
│   └── avatar/
│       ├── VRMAvatar.tsx          # Main 3D avatar component
│       ├── AvatarCanvas.tsx        # React Three Fiber canvas wrapper
│       └── Avatar.tsx              # Keep 2D as fallback
├── services/
│   └── avatar/
│       ├── lipSyncController.ts   # Lip sync coordination
│       ├── phonemeParser.ts       # Text to phoneme conversion
│       └── vrmLoader.ts           # VRM model loading utility
├── contexts/
│   └── AudioContext.tsx           # Enhanced with lip sync state
└── types/
    └── avatar.ts                  # Avatar types (update for 3D)
```

### Performance Considerations

**Bundle Size:**
- three.js: ~600KB (gzipped: ~200KB)
- @react-three/fiber: ~50KB (gzipped: ~15KB)
- @pixiv/three-vrm: ~300KB (gzipped: ~100KB)
- VRM model file: ~1-5MB (can be lazy loaded)
- **Total**: ~2-6MB additional (can be code-split)

**Runtime Performance:**
- WebGL rendering: ~60fps on modern hardware
- Expression updates: Minimal overhead
- Memory: VRM model in GPU memory (~50-100MB)

**Optimization Strategies:**
- Lazy load 3D avatar (only when needed)
- Code-split three.js dependencies
- Use lower poly model for performance
- Optimize VRM model (reduce texture size)

### Browser Compatibility

**Requirements:**
- WebGL 2.0 support (Chrome 56+, Firefox 51+, Safari 15+)
- Modern JavaScript (ES2020+)
- GPU acceleration recommended

**Fallback:**
- Keep 2D SVG avatar as fallback
- Detect WebGL support
- Gracefully degrade if 3D unavailable

### Cost Considerations

**Free Options:**
- Free VRM models from Booth, VRoid Hub
- Open-source libraries (three.js, three-vrm)
- Self-hosted (no API costs)

**Paid Options:**
- Custom 3D model creation: $500-$5000
- Premium avatar models: $50-$500
- Ready-made avatar services: $20-100/month

### Challenges & Risks

1. **Phoneme Accuracy**: Text-to-phoneme may not be perfect
   - Mitigation: Use established libraries, test with various texts

2. **Performance on Low-End Devices**: 3D rendering can be heavy
   - Mitigation: Provide 2D fallback, optimize model

3. **Model Sourcing**: Need appropriate VRM model
   - Mitigation: Use free models, or create custom model

4. **Bundle Size**: Additional dependencies increase bundle
   - Mitigation: Code splitting, lazy loading

5. **Learning Curve**: Team needs Three.js/WebGL knowledge
   - Mitigation: Use React Three Fiber (simpler API), good docs

### Success Criteria

- [ ] 3D avatar loads and displays correctly
- [ ] Lip sync matches audio playback accurately
- [ ] Smooth 60fps animation on target devices
- [ ] Bundle size increase < 2MB (gzipped)
- [ ] Works on Chrome, Firefox, Safari (latest 2 versions)
- [ ] 2D fallback works if 3D unavailable
- [ ] Expression transitions are smooth
- [ ] Idle animations work when not speaking

### Next Steps

1. **Research & Prototype** (1 week)
   - Test VRM loading with React Three Fiber
   - Create simple phoneme-to-expression mapping
   - Measure performance impact

2. **Decision Point**
   - Review prototype results
   - Decide on phoneme detection approach
   - Choose VRM model source

3. **Implementation**
   - Follow phased approach above
   - Regular testing and iteration
   - Performance monitoring

## Alternative: Enhanced 2D Avatar

If 3D implementation is too complex, consider enhancing the current 2D avatar:
- More detailed mouth shapes (8-12 phoneme shapes)
- Better animation timing
- Facial expressions via SVG morphing
- **Estimated Time: 1-2 weeks**

This would provide better lip sync without the complexity of 3D rendering.

