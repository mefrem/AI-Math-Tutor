/**
 * ImageProblemInput component
 * Allows students to upload an image of their math problem
 */

"use client";

import { useState, useRef } from "react";
import type { MathProblem } from "@/types/models";
import { parseImage } from "@/services/api/parseImageApi";

interface ImageProblemInputProps {
  onSubmit: (problem: MathProblem) => void;
  onBack: () => void;
  onSwitchToText?: () => void; // Optional - not needed in unified view
  isLoading?: boolean;
  hideBackButton?: boolean; // Hide back button in unified view
}

/**
 * Valid file types for image upload
 */
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Validate file type
 */
function validateFileType(file: File): string | null {
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  const mimeType = file.type;

  // Check MIME type
  if (mimeType && !ALLOWED_FILE_TYPES.includes(mimeType)) {
    return "Please upload a PNG, JPG, or JPEG image";
  }

  // Check file extension
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Please upload a PNG, JPG, or JPEG image";
  }

  return null;
}

/**
 * Validate file size
 */
function validateFileSize(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return "File size must be less than 5MB";
  }
  return null;
}

/**
 * Convert file to base64 data URI
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a unique problem ID
 */
function generateProblemId(): string {
  return `problem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function ImageProblemInput({
  onSubmit,
  onBack,
  onSwitchToText,
  isLoading = false,
  hideBackButton = false,
}: ImageProblemInputProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedText, setParsedText] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = async (file: File) => {
    // Clear previous error
    setError(null);

    // Validate file type
    const typeError = validateFileType(file);
    if (typeError) {
      setError(typeError);
      return;
    }

    // Validate file size
    const sizeError = validateFileSize(file);
    if (sizeError) {
      setError(sizeError);
      return;
    }

    // Set file and create preview
    setImageFile(file);

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);
      setImageBase64(base64);
      setImagePreview(base64);
    } catch (err) {
      setError("Failed to process image. Please try again.");
      setImageFile(null);
      setImagePreview(null);
      setImageBase64(null);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle file picker button click
   */
  const handleFilePickerClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle clear image
   */
  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
    setError(null);
    setParsedText(null);
    setShowConfirmation(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Handle parse problem (OCR)
   */
  const handleParseProblem = async () => {
    if (!imageBase64) {
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const response = await parseImage(imageBase64);
      setParsedText(response.parsedContent);
      setShowConfirmation(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to parse image. Please try again or enter manually."
      );
    } finally {
      setIsParsing(false);
    }
  };

  /**
   * Handle approve parsed text
   */
  const handleApprove = () => {
    if (!parsedText || !imageBase64) {
      return;
    }

    const problem: MathProblem = {
      problemId: generateProblemId(),
      source: "image",
      rawContent: parsedText,
      parsedContent: parsedText,
      imageUrl: imageBase64, // Store base64 image for future reference
    };

    onSubmit(problem);
  };

  /**
   * Handle edit parsed text
   */
  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setParsedText(e.target.value);
  };

  /**
   * Handle re-upload
   */
  const handleReUpload = () => {
    setParsedText(null);
    setShowConfirmation(false);
    handleClearImage();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Toggle between text and image input - hidden in unified mode */}

      {/* Image upload area */}
      {!imagePreview && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Upload image file"
          />

          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="text-lg font-semibold text-gray-900 mb-2">
            Drag and drop your image here
          </p>
          <p className="text-sm text-gray-600 mb-4">
            or click the button below to select a file
          </p>

          <button
            type="button"
            onClick={handleFilePickerClick}
            disabled={isLoading}
            className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ minHeight: "44px" }}
          >
            Choose File
          </button>

          <p className="mt-4 text-xs text-gray-500">
            Supported formats: PNG, JPG, JPEG (max 5MB)
          </p>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && !showConfirmation && (
        <div className="mb-6">
          <div className="relative border border-gray-300 rounded-lg p-4 bg-white">
            <img
              src={imagePreview}
              alt="Uploaded problem"
              className="max-w-full h-auto mx-auto rounded"
              style={{ maxHeight: "400px" }}
            />
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute top-2 right-2 p-2 text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              aria-label="Remove image"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Parsed text confirmation */}
      {showConfirmation && parsedText && (
        <div className="mb-6">
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Is this correct?
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Review the extracted problem below. You can edit it if needed.
            </p>
            <textarea
              value={parsedText}
              onChange={handleEditChange}
              placeholder="Parsed problem text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={6}
              style={{ minHeight: "120px" }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-700 mb-2" role="alert">
            {error}
          </p>
          {onSwitchToText && (
            <button
              type="button"
              onClick={onSwitchToText}
              className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              Enter manually instead
            </button>
          )}
        </div>
      )}

      {/* Loading state during parsing */}
      {isParsing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-blue-700 font-medium">Parsing your problem...</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4 justify-end">
        {/* Hide Back button in unified view */}
        {!hideBackButton && (
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading || isParsing}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>
        )}

        {/* Show Parse Problem button when image is uploaded but not yet parsed */}
        {imagePreview && imageBase64 && !showConfirmation && (
          <button
            type="button"
            onClick={handleParseProblem}
            disabled={isLoading || isParsing}
            className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ minHeight: "44px" }}
          >
            {isParsing ? "Parsing..." : "Parse Problem"}
          </button>
        )}

        {/* Show confirmation buttons when parsed text is shown */}
        {showConfirmation && parsedText && (
          <>
            <button
              type="button"
              onClick={handleReUpload}
              disabled={isLoading || isParsing}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Re-upload
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isLoading || isParsing || !parsedText.trim()}
              className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ minHeight: "44px" }}
            >
              Yes, this is correct
            </button>
          </>
        )}
      </div>
    </div>
  );
}
