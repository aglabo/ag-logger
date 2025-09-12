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
 * MockFormatter.errorThrow 基本動作テストスイート
 *
 * atsushifx式BDD厳格プロセスに従い、基本的な正常動作を検証
 * 各it/expectごとにRed-Green-Refactorサイクルを維持
 */
describe('When using MockFormatter.errorThrow for basic operations', () => {
  // 共通テストデータ
  const createTestMessage = (message = 'Test message'): AgLogMessage => ({
    timestamp: new Date('2025-01-01T00:00:00.000Z'),
    logLevel: AG_LOGLEVEL.INFO,
    message,
    args: [],
  });

  const dummyRoutine: AgFormatRoutine = (msg) => msg;

  describe('When using basic error throwing functionality', () => {
    it('Then [正常]: throw default mock error', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      // Act & Assert
      expect(() => instance.execute(testMessage)).toThrow('Default mock error');
    });

    it('Then [正常]: throw custom default error', () => {
      // Arrange
      const customMessage = 'Custom initialization error';
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine, customMessage);
      const testMessage = createTestMessage();

      // Act & Assert
      expect(() => instance.execute(testMessage)).toThrow(customMessage);
    });

    it('Then [正常]: has AgMockConstructor marker', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;

      // Act & Assert
      expect(FormatterClass.__isMockConstructor).toBe(true);
    });
  });

  describe('When using dynamic error message changes', () => {
    it('Then [正常]: setErrorMessage changes runtime error message', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const newErrorMessage = 'Runtime changed error';

      // Act & Assert - 初期状態
      expect(() => instance.execute(testMessage)).toThrow('Default mock error');

      // Act - メッセージ変更
      instance.setErrorMessage(newErrorMessage);

      // Assert - 変更後
      expect(() => instance.execute(testMessage)).toThrow(newErrorMessage);
    });

    it('Then [正常]: multiple setErrorMessage updates in order', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      const firstMessage = 'First error message';
      const secondMessage = 'Second error message';
      const thirdMessage = 'Third error message';

      // Act & Assert - 第1回変更
      instance.setErrorMessage(firstMessage);
      expect(() => instance.execute(testMessage)).toThrow(firstMessage);

      // Act & Assert - 第2回変更
      instance.setErrorMessage(secondMessage);
      expect(() => instance.execute(testMessage)).toThrow(secondMessage);

      // Act & Assert - 第3回変更
      instance.setErrorMessage(thirdMessage);
      expect(() => instance.execute(testMessage)).toThrow(thirdMessage);
    });
  });

  describe('When using error message retrieval', () => {
    it('Then [正常]: getErrorMessage returns current message', () => {
      // Arrange
      const customMessage = 'Initial custom message';
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine, customMessage);

      // Act & Assert - 初期メッセージ
      expect(instance.getErrorMessage()).toBe(customMessage);
    });

    it('Then [正常]: getErrorMessage reflects setErrorMessage', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const newMessage = 'Changed message';

      // Act
      instance.setErrorMessage(newMessage);

      // Assert
      expect(instance.getErrorMessage()).toBe(newMessage);
    });
  });

  describe('When using statistics functionality', () => {
    it('Then [正常]: stats updated even when throwing', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      // Act & Assert - 初期状態
      expect(instance.getStats().callCount).toBe(0);
      expect(instance.getStats().lastMessage).toBeNull();

      // Act - 1回目実行
      expect(() => instance.execute(testMessage)).toThrow();

      // Assert - 1回目後
      expect(instance.getStats().callCount).toBe(1);
      expect(instance.getStats().lastMessage).toEqual(testMessage);

      // Act - 2回目実行
      expect(() => instance.execute(testMessage)).toThrow();

      // Assert - 2回目後
      expect(instance.getStats().callCount).toBe(2);
      expect(instance.getStats().lastMessage).toEqual(testMessage);
    });

    it('Then [正常]: reset clears stats to 0/null', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      // Act - 複数回実行して統計を蓄積
      expect(() => instance.execute(testMessage)).toThrow();
      expect(() => instance.execute(testMessage)).toThrow();
      expect(() => instance.execute(testMessage)).toThrow();

      // Assert - 統計が蓄積されていることを確認
      expect(instance.getStats().callCount).toBe(3);
      expect(instance.getStats().lastMessage).toEqual(testMessage);

      // Act - リセット
      instance.reset();

      // Assert - 統計がクリアされたことを確認
      expect(instance.getStats().callCount).toBe(0);
      expect(instance.getStats().lastMessage).toBeNull();
    });

    it('Then [正常]: stats continue to update after setErrorMessage', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();

      // Act - 初回実行
      expect(() => instance.execute(testMessage)).toThrow();

      // Assert - 初回統計確認
      expect(instance.getStats().callCount).toBe(1);

      // Act - エラーメッセージ変更
      instance.setErrorMessage('New error message');

      // Act - 変更後実行
      expect(() => instance.execute(testMessage)).toThrow('New error message');

      // Assert - 統計が継続されていることを確認
      expect(instance.getStats().callCount).toBe(2);
      expect(instance.getStats().lastMessage).toEqual(testMessage);
    });
  });
});
