/**
 * Header Component
 * Professional header with logo and branding for presentation
 */

"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <span className="text-white text-xl md:text-2xl font-bold">π</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                AI Math Tutor
              </span>
              <span className="text-xs text-gray-500 hidden sm:block">
                Socratic Learning Assistant
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/workspace" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Workspace
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Live Demo</span>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}






