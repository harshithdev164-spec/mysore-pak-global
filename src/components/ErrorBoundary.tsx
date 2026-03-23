"use client";

import React, { Component } from "react";

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev; swap for Sentry/Datadog in prod
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-[#FBF7F0]">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">🍬</div>
            <h2 className="text-xl font-bold text-[#1B3A2D] mb-2">Something went wrong</h2>
            <p className="text-[#1B3A2D]/50 text-sm mb-6">
              Don&apos;t worry — your cart is safe. Please refresh to continue shopping.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#1B3A2D] text-[#FBF7F0] px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#2D5A3D] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
