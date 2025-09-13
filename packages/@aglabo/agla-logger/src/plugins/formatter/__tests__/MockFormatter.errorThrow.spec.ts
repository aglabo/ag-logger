//
// Copyright (C) 2025 atsushifx
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';

// types
import { AG_LOGLEVEL } from '../../../../shared/types';
import type { AgLogMessage } from '../../../../shared/types';
import type { AgFormatRoutine } from '../../../../shared/types/AgMockConstructor.class';

// target
import { MockFormatter } from '../MockFormatter';

/**
 * MockFormatter.errorThrow 包括テストスイート
 *
 * 基本動作・エッジケース・エラーハンドリングを統合した包括的テスト
 * atsushifx式BDD厳格プロセス: Given-When-Then 3層構造
 */
describe('MockFormatter.errorThrow - Comprehensive Tests', () => {
  // 共通テストデータ
  const createTestMessage = (message = 'Test message'): AgLogMessage => ({
    timestamp: new Date('2025-01-01T00:00:00.000Z'),
    logLevel: AG_LOGLEVEL.INFO,
    message,
    args: [],
  });

  const dummyRoutine: AgFormatRoutine = (msg) => msg;

  describe('Given: MockFormatter.errorThrow instance', () => {
    describe('When: performing basic operations', () => {
      it('Then: should throw default mock error', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        expect(() => instance.execute(testMessage)).toThrow('Default mock error');
      });

      it('Then: should throw custom default error', () => {
        const customMessage = 'Custom initialization error';
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine, customMessage);
        const testMessage = createTestMessage();

        expect(() => instance.execute(testMessage)).toThrow(customMessage);
      });

      it('Then: should have AgMockConstructor marker', () => {
        const FormatterClass = MockFormatter.errorThrow;
        expect(FormatterClass.__isMockConstructor).toBe(true);
      });

      it('Then: should update error message dynamically', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const newErrorMessage = 'Runtime changed error';

        expect(() => instance.execute(testMessage)).toThrow('Default mock error');

        instance.setErrorMessage(newErrorMessage);
        expect(() => instance.execute(testMessage)).toThrow(newErrorMessage);
      });

      it('Then: should maintain statistics even when throwing', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        expect(instance.getStats().callCount).toBe(0);
        expect(() => instance.execute(testMessage)).toThrow();
        expect(instance.getStats().callCount).toBe(1);
        expect(instance.getStats().lastMessage).toEqual(testMessage);
      });
    });

    describe('When: handling edge case inputs', () => {
      it('Then: should handle empty string message', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        instance.setErrorMessage('');
        expect(() => instance.execute(testMessage)).toThrow('');
      });

      it('Then: should handle very long messages', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const longMessage = 'A'.repeat(1000);

        instance.setErrorMessage(longMessage);
        expect(() => instance.execute(testMessage)).toThrow(longMessage);
      });

      it('Then: should handle multiline messages', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const multilineMessage = 'Line 1\nLine 2\nLine 3';

        instance.setErrorMessage(multilineMessage);
        expect(() => instance.execute(testMessage)).toThrow(multilineMessage);
      });

      it('Then: should handle Unicode characters', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const unicodeMessage = '🚨 エラーが発生しました 💥';

        instance.setErrorMessage(unicodeMessage);
        expect(() => instance.execute(testMessage)).toThrow(unicodeMessage);
      });

      it('Then: should handle special format strings', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const jsonMessage = '{"error": "Database failed", "code": 500}';

        instance.setErrorMessage(jsonMessage);
        expect(() => instance.execute(testMessage)).toThrow(jsonMessage);
      });
    });

    describe('When: handling type coercion scenarios', () => {
      it('Then: should stringify null to "null"', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        instance.setErrorMessage(null as unknown as string);
        expect(() => instance.execute(testMessage)).toThrow('null');
      });

      it('Then: should stringify undefined to empty string', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        instance.setErrorMessage(undefined as unknown as string);
        expect(() => instance.execute(testMessage)).toThrow('');
      });

      it('Then: should stringify numbers', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        instance.setErrorMessage(12345 as unknown as string);
        expect(() => instance.execute(testMessage)).toThrow('12345');
      });

      it('Then: should stringify booleans', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        instance.setErrorMessage(true as unknown as string);
        expect(() => instance.execute(testMessage)).toThrow('true');
      });

      it('Then: should stringify objects as [object Object]', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();
        const objectMessage = { error: 'test error', code: 500 };

        instance.setErrorMessage(objectMessage as unknown as string);
        expect(() => instance.execute(testMessage)).toThrow('[object Object]');
      });
    });

    describe('When: performing utility operations', () => {
      it('Then: should reset statistics correctly', () => {
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine);
        const testMessage = createTestMessage();

        // Execute multiple times to accumulate stats
        expect(() => instance.execute(testMessage)).toThrow();
        expect(() => instance.execute(testMessage)).toThrow();
        expect(instance.getStats().callCount).toBe(2);

        // Reset and verify
        instance.reset();
        expect(instance.getStats().callCount).toBe(0);
        expect(instance.getStats().lastMessage).toBeNull();
      });

      it('Then: should return current error message via getter', () => {
        const customMessage = 'Initial custom message';
        const FormatterClass = MockFormatter.errorThrow;
        const instance = new FormatterClass(dummyRoutine, customMessage);

        expect(instance.getErrorMessage()).toBe(customMessage);

        const newMessage = 'Changed message';
        instance.setErrorMessage(newMessage);
        expect(instance.getErrorMessage()).toBe(newMessage);
      });
    });
  });
});
