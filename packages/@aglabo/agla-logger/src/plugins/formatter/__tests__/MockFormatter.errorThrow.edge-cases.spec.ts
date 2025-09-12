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
 * MockFormatter.errorThrow エッジケーステストスイート
 *
 * atsushifx式BDD厳格プロセスに従い、特殊文字列・境界値を検証
 * 各it/expectごとにRed-Green-Refactorサイクルを維持
 */
describe('When handling edge cases with MockFormatter.errorThrow', () => {
  // 共通テストデータ
  const createTestMessage = (message = 'Test message'): AgLogMessage => ({
    timestamp: new Date('2025-01-01T00:00:00.000Z'),
    logLevel: AG_LOGLEVEL.INFO,
    message,
    args: [],
  });

  const dummyRoutine: AgFormatRoutine = (msg) => msg;

  describe('When using special string patterns', () => {
    it('Then [エッジ]: empty string message throws', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const emptyMessage = '';

      // Act - 空文字列を設定
      instance.setErrorMessage(emptyMessage);

      // Assert - 空文字列でErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow('');
    });

    it('Then [エッジ]: very long message (1000 chars)', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const longMessage = 'A'.repeat(1000); // 1000文字のメッセージ

      // Act - 長いメッセージを設定
      instance.setErrorMessage(longMessage);

      // Assert - 長いメッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(longMessage);
    });

    it('Then [エッジ]: multiline message throws', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const multilineMessage = 'Line 1\nLine 2\nLine 3';

      // Act - 改行文字を含むメッセージを設定
      instance.setErrorMessage(multilineMessage);

      // Assert - 改行文字を含むメッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(multilineMessage);
    });

    it('Then [エッジ]: tab characters message throws', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const tabMessage = 'Column1\tColumn2\tColumn3';

      // Act - タブ文字を含むメッセージを設定
      instance.setErrorMessage(tabMessage);

      // Assert - タブ文字を含むメッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(tabMessage);
    });

    it('Then [エッジ]: control characters message throws', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const controlMessage = 'Error\u0000with\u0007control\u001bchars';

      // Act - 制御文字を含むメッセージを設定
      instance.setErrorMessage(controlMessage);

      // Assert - 制御文字を含むメッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(controlMessage);
    });
  });

  describe('When processing Unicode characters', () => {
    it('Then [正常]: Japanese message throws', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const japaneseMessage = 'エラーが発生しました：データベース接続に失敗';

      // Act - 日本語メッセージを設定
      instance.setErrorMessage(japaneseMessage);

      // Assert - 日本語メッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(japaneseMessage);
    });

    it('Then [正常]: emoji message throws', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const emojiMessage = '🚨 Critical Error 💥 System Failure 🔥';

      // Act - 絵文字を含むメッセージを設定
      instance.setErrorMessage(emojiMessage);

      // Assert - 絵文字を含むメッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(emojiMessage);
    });

    it('Then [正常]: complex Unicode message throws', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const complexUnicode = '👨‍💻 Developer Error: 한국어 中文 عربي';

      // Act - 複合Unicode文字を含むメッセージを設定
      instance.setErrorMessage(complexUnicode);

      // Assert - 複合Unicode文字を含むメッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(complexUnicode);
    });
  });

  describe('When using special format strings', () => {
    it('Then [正常]: JSON-like string message throws', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const jsonMessage = '{"error": "Database connection failed", "code": 500, "timestamp": "2025-01-01T00:00:00Z"}';

      // Act - JSON形式文字列を設定
      instance.setErrorMessage(jsonMessage);

      // Assert - JSON形式文字列でErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(jsonMessage);
    });

    it('Then [正常]: HTML-like string message throws', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const htmlMessage = '<span class="error">Critical Error:</span> <b>System Failure</b>';

      // Act - HTMLタグを含むメッセージを設定
      instance.setErrorMessage(htmlMessage);

      // Assert - HTMLタグを含むメッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(htmlMessage);
    });

    it('Then [正常]: regex pattern string message throws', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const regexMessage = 'Invalid pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/';

      // Act - 正規表現パターンを含むメッセージを設定
      instance.setErrorMessage(regexMessage);

      // Assert - 正規表現パターンを含むメッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(regexMessage);
    });

    it('Then [正常]: escaped path string message throws', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const escapeMessage = 'Path error: "C:\\Users\\test\\file.txt" not found';

      // Act - エスケープシーケンスを含むメッセージを設定
      instance.setErrorMessage(escapeMessage);

      // Assert - エスケープシーケンスを含むメッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(escapeMessage);
    });
  });

  describe('When testing boundary values', () => {
    it('Then [エッジ]: single char message', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const singleChar = 'X';

      // Act - 単一文字メッセージを設定
      instance.setErrorMessage(singleChar);

      // Assert - 単一文字メッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(singleChar);
    });

    it('Then [エッジ]: spaces-only message', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const spacesMessage = '   ';

      // Act - スペースのみのメッセージを設定
      instance.setErrorMessage(spacesMessage);

      // Assert - スペースのみのメッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(spacesMessage);
    });

    it('Then [エッジ]: extremely long message (10000 chars)', () => {
      // Arrange
      const FormatterClass = MockFormatter.errorThrow;
      const instance = new FormatterClass(dummyRoutine);
      const testMessage = createTestMessage();
      const extremelyLongMessage = 'Error: ' + 'A'.repeat(9993); // 10000文字のメッセージ

      // Act - 極端に長いメッセージを設定
      instance.setErrorMessage(extremelyLongMessage);

      // Assert - 極端に長いメッセージでErrorを投げる
      expect(() => instance.execute(testMessage)).toThrow(extremelyLongMessage);
    });
  });
});
