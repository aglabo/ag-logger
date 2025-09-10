// src: src/__tests__/helpers/TestAglaError.class.ts
// @(#) : Test utility class for AglaError testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Type definitions
import { AglaError, type AglaErrorOptions } from '../../../shared/types/AglaError.types';

/**
 * Test utility class extending AglaError for testing purposes.
 * Provides concrete implementation of the abstract AglaError class with test-specific functionality.
 */
export class TestAglaError extends AglaError {
  /**
   * Creates a new TestAglaError instance for testing.
   * @param errorType - The error type identifying the specific type of error
   * @param message - The human-readable error message
   * @param options - Optional configuration including code, severity, timestamp, and context
   */
  constructor(
    errorType: string,
    message: string,
    options?: AglaErrorOptions,
  ) {
    super(errorType, message, options);
  }

  /**
   * Overrides chain method to add custom message formatting.
   * Adds "[TEST]" prefix to demonstrate inheritance type safety.
   */
  chain(cause: Error): this {
    // カスタムメッセージフォーマット
    this.message = `[TEST] ${this.message}`;
    // 親クラスのchain処理を呼び出し
    return super.chain(cause);
  }
}
