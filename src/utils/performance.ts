/**
 * Performance Measurement Utilities
 * Story 5.2: Performance Validation and Optimization
 */

export interface PerformanceMetrics {
  llmResponse?: number;
  voiceTranscription?: number;
  ttsGeneration?: number;
  canvasFPS?: number;
  imageOCR?: number;
}

export interface PerformanceMeasurement {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

/**
 * Performance measurement class for tracking operation latencies
 */
export class PerformanceMonitor {
  private measurements: Map<string, PerformanceMeasurement> = new Map();
  private samples: Map<string, number[]> = new Map();

  /**
   * Start measuring a performance operation
   */
  start(operationName: string): void {
    const measurement: PerformanceMeasurement = {
      name: operationName,
      startTime: performance.now(),
    };
    this.measurements.set(operationName, measurement);
  }

  /**
   * End measuring a performance operation and return duration
   */
  end(operationName: string): number | null {
    const measurement = this.measurements.get(operationName);
    if (!measurement) {
      console.warn(`[Performance] No measurement found for: ${operationName}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - measurement.startTime;

    measurement.endTime = endTime;
    measurement.duration = duration;

    // Store sample for averaging
    if (!this.samples.has(operationName)) {
      this.samples.set(operationName, []);
    }
    this.samples.get(operationName)!.push(duration);

    // Log measurement
    console.log(`[Performance] ${operationName}: ${duration.toFixed(2)}ms`);

    return duration;
  }

  /**
   * Get average duration for an operation (across all samples)
   */
  getAverage(operationName: string): number | null {
    const samples = this.samples.get(operationName);
    if (!samples || samples.length === 0) {
      return null;
    }

    const sum = samples.reduce((a, b) => a + b, 0);
    return sum / samples.length;
  }

  /**
   * Get all samples for an operation
   */
  getSamples(operationName: string): number[] {
    return this.samples.get(operationName) || [];
  }

  /**
   * Get summary statistics for all measured operations
   */
  getSummary(): Record<string, { average: number; samples: number; min: number; max: number }> {
    const summary: Record<string, { average: number; samples: number; min: number; max: number }> = {};

    for (const [operationName, samples] of this.samples.entries()) {
      if (samples.length > 0) {
        const average = samples.reduce((a, b) => a + b, 0) / samples.length;
        const min = Math.min(...samples);
        const max = Math.max(...samples);
        summary[operationName] = {
          average,
          samples: samples.length,
          min,
          max,
        };
      }
    }

    return summary;
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.measurements.clear();
    this.samples.clear();
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Measure LLM response latency
 * Starts when message is sent, ends when response is received
 */
export function measureLLMResponse(
  messagePromise: Promise<unknown>
): Promise<{ result: unknown; duration: number }> {
  performanceMonitor.start('llmResponse');
  return messagePromise.then((result) => {
    const duration = performanceMonitor.end('llmResponse') || 0;
    return { result, duration };
  });
}

/**
 * Measure voice transcription latency
 * Starts when recording stops, ends when transcription is complete
 */
export function measureVoiceTranscription(
  transcriptionPromise: Promise<string>
): Promise<{ result: string; duration: number }> {
  performanceMonitor.start('voiceTranscription');
  return transcriptionPromise.then((result) => {
    const duration = performanceMonitor.end('voiceTranscription') || 0;
    return { result, duration };
  });
}

/**
 * Measure TTS generation latency
 * Starts when response text is ready, ends when audio playback starts
 */
export function measureTTSGeneration(
  ttsPromise: Promise<unknown>
): Promise<{ result: unknown; duration: number }> {
  performanceMonitor.start('ttsGeneration');
  return ttsPromise.then((result) => {
    const duration = performanceMonitor.end('ttsGeneration') || 0;
    return { result, duration };
  });
}

/**
 * Measure image OCR latency
 * Starts when image is uploaded, ends when parsed problem is displayed
 */
export function measureImageOCR(
  ocrPromise: Promise<unknown>
): Promise<{ result: unknown; duration: number }> {
  performanceMonitor.start('imageOCR');
  return ocrPromise.then((result) => {
    const duration = performanceMonitor.end('imageOCR') || 0;
    return { result, duration };
  });
}

/**
 * Canvas FPS measurement using requestAnimationFrame
 */
export class CanvasFPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  private rafId: number | null = null;
  private callback?: (fps: number) => void;

  /**
   * Start FPS monitoring
   */
  start(callback?: (fps: number) => void): void {
    this.callback = callback;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.measure();
  }

  /**
   * Measure FPS using requestAnimationFrame
   */
  private measure(): void {
    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime >= this.lastTime + 1000) {
      // Calculate FPS over last second
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;

      if (this.callback) {
        this.callback(this.fps);
      }

      // Log FPS disabled per user request
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`[Performance] Canvas FPS: ${this.fps}`);
      // }
    }

    this.rafId = requestAnimationFrame(() => this.measure());
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Stop FPS monitoring
   */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

/**
 * Get performance summary for logging/reporting
 */
export function getPerformanceSummary(): string {
  const summary = performanceMonitor.getSummary();
  const lines = ['Performance Summary:', ''];

  for (const [operation, stats] of Object.entries(summary)) {
    lines.push(
      `${operation}:`,
      `  Average: ${stats.average.toFixed(2)}ms`,
      `  Samples: ${stats.samples}`,
      `  Min: ${stats.min.toFixed(2)}ms`,
      `  Max: ${stats.max.toFixed(2)}ms`,
      ''
    );
  }

  return lines.join('\n');
}

