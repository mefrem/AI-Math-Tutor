/**
 * Standard error handler for API routes
 * Maps OpenAI errors and other errors to standard ApiError format
 */

import { NextResponse } from 'next/server';
import type { ApiError } from '@/types/api';
import OpenAI from 'openai';

/**
 * Generate a UUID-like request ID for error tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Handle API errors and return standardized error response
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  const requestId = generateRequestId();
  const timestamp = new Date().toISOString();

  // Handle OpenAI API errors
  if (error instanceof OpenAI.APIError) {
    const statusCode = error.status || 500;
    let errorCode = 'INTERNAL_ERROR';
    let message = 'An error occurred while processing your request';

    // Map OpenAI error status codes to standard error codes
    if (statusCode === 401) {
      errorCode = 'INVALID_API_KEY';
      message = 'Invalid API key. Please check your OpenAI API key configuration.';
    } else if (statusCode === 429) {
      errorCode = 'RATE_LIMIT';
      message = 'Rate limit exceeded. Please try again later.';
    } else if (statusCode === 400) {
      errorCode = 'INVALID_REQUEST';
      message = error.message || 'Invalid request to OpenAI API.';
    } else if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
      errorCode = 'OPENAI_SERVICE_ERROR';
      message = 'OpenAI service is temporarily unavailable. Please try again later.';
    }

    return NextResponse.json<ApiError>(
      {
        error: {
          code: errorCode,
          message,
          details: {
            openaiError: error.message,
            status: error.status,
            requestId: error.requestID,
          },
          timestamp,
          requestId,
        },
      },
      { status: statusCode }
    );
  }

  // Handle network errors
  if (error instanceof Error) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'NETWORK_ERROR',
            message: 'Network error occurred. Please check your connection and try again.',
            details: { originalError: error.message },
            timestamp,
            requestId,
          },
        },
        { status: 500 }
      );
    }

    // Handle timeout errors
    if (error.message.includes('timeout')) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'TIMEOUT_ERROR',
            message: 'Request timed out. Please try again.',
            details: { originalError: error.message },
            timestamp,
            requestId,
          },
        },
        { status: 504 }
      );
    }
  }

  // Handle unknown errors
  return NextResponse.json<ApiError>(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
        details: error instanceof Error ? { originalError: error.message } : undefined,
        timestamp,
        requestId,
      },
    },
    { status: 500 }
  );
}

