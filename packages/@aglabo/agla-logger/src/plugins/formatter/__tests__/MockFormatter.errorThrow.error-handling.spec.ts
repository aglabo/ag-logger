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
 * MockFormatter.errorThrow エラーハンドリングテストスイート
 *
 * atsushifx式BDD厳格プロセスに従い、異常系・型安全性を検証
 * 各it/expectごとにRed-Green-Refactorサイクルを維持
 */
describe('When handling error cases with MockFormatter.errorThrow', () => {
  // 共通テストデータ
  const createTestMessage = (message = 'Test message'): AgLogMessage => ({
    timestamp: new Date('2025-01-01T00:00:00.000Z'),
    logLevel: AG_LOGLEVEL.INFO,
    message,
    args: [],
  });

  const dummyRoutine: AgFormatRoutine = (msg) => msg;

  describe('When handling null/undefined values', () => {
    it('Then [エッジ]: null message still throws ("null")', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      // Act - nullメッセージを設定
      instance.setErrorMessage(null as unknown as string);

      // Assert - nullが文字列化されてエラーメッセージになる
      expect(() => instance.execute(testMessage)).toThrow('null');
    });

    it('Then [エッジ]: undefined message throws (empty string)', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      // Act - undefinedメッセージを設定
      instance.setErrorMessage(undefined as unknown as string);

      // Assert - undefinedが空文字列になってErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow('');
    });

    it('Then [エッジ]: undefined default uses "Default mock error"', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine, undefined as unknown as string);
      const testMessage = createTestMessage();

      // Act & Assert - undefinedはデフォルト引数になりDefault mock errorになる
      expect(() => instance.execute(testMessage)).toThrow('Default mock error');
    });
  });

  describe('When handling non-string parameters for type safety', () => {
    it('Then [エッジ]: number is stringified', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const numberMessage = 12345;

      // Act - 数値をメッセージに設定
      instance.setErrorMessage(numberMessage as unknown as string);

      // Assert - 数値が文字列化される
      expect(() => instance.execute(testMessage)).toThrow('12345');
    });

    it('Then [エッジ]: boolean is stringified', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      // Act - booleanをメッセージに設定
      instance.setErrorMessage(true as unknown as string);

      // Assert - booleanが文字列化される
      expect(() => instance.execute(testMessage)).toThrow('true');
    });

    it('Then [エッジ]: object is stringified as [object Object]', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const objectMessage = { error: 'test error', code: 500 };

      // Act - オブジェクトをメッセージに設定
      instance.setErrorMessage(objectMessage as unknown as string);

      // Assert - オブジェクトが文字列化される
      expect(() => instance.execute(testMessage)).toThrow('[object Object]');
    });

    it('Then [エッジ]: array is stringified (join by comma)', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const arrayMessage = ['error1', 'error2', 'error3'];

      // Act - 配列をメッセージに設定
      instance.setErrorMessage(arrayMessage as unknown as string);

      // Assert - 配列が文字列化される
      expect(() => instance.execute(testMessage)).toThrow('error1,error2,error3');
    });
  });

  describe('When using invalid constructor arguments', () => {
    it('Then [エッジ]: null default message is stringified', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine, null as unknown as string);
      const testMessage = createTestMessage();

      // Act & Assert - nullが文字列化される
      expect(() => instance.execute(testMessage)).toThrow('null');
    });

    it('Then [エッジ]: numeric default message is stringified', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine, 404 as unknown as string);
      const testMessage = createTestMessage();

      // Act & Assert - 数値が文字列化される
      expect(() => instance.execute(testMessage)).toThrow('404');
    });

    it('Then [エッジ]: object default message is stringified', () => {
      // Arrange
      const errorObject = { message: 'Custom error', status: 'failed' };
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine, errorObject as unknown as string);
      const testMessage = createTestMessage();

      // Act & Assert - オブジェクトが文字列化される
      expect(() => instance.execute(testMessage)).toThrow('[object Object]');
    });
  });
});
