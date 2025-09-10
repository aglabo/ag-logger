// src: /src/plugins/format/__tests__/JsonFormatter.spec.ts
// @(#) : JUnit tests for JsonFormatter plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行とアサーション機能を提供
import { describe, expect, it } from 'vitest';

// ログレベル定数 - テストで使用するログレベル定義
import { AG_LOGLEVEL } from '../../../../../shared/types';
// 型定義 - ログメッセージの構造を定義する型
import type { AgLogMessage } from '../../../../../shared/types/AgLogger.types';

// テスト対象 - JSON形式フォーマッタープラグインの実装
import { JsonFormatter } from '../../../../plugins/formatter/JsonFormatter';

// test main

/**
 * JsonFormatterプラグインのユニットテストスイート
 *
 * @description JSON形式でのログメッセージフォーマット機能を検証する
 * Given/When/Then構造によりテストケースを体系化し、
 * 正常系・異常系・エッジケースを明確に分離して品質を向上
 *
 * @testType Unit Test
 * @testTarget JsonFormatter Plugin
 * @coverage
 * - 基本ログメッセージのJSON構造化
 * - 引数・配列・オブジェクトの適切なシリアライゼーション
 * - 全ログレベルでの正確なレベル表示
 * - タイムスタンプの正確な形式
 * - 循環参照・null/undefined・例外処理
 * - 有効なJSON文字列の出力保証
 */
describe('Given: JsonFormatter with valid log message structures', () => {
  describe('When: formatting basic log messages', () => {
    it('Then: should format basic log message as JSON - 正常系', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Test message',
        args: [],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.timestamp).toBe('2025-01-01T12:00:00.000Z');
      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('Test message');
      expect(parsed.args).toBeUndefined();
    });

    it('Then: should format log message with arguments as JSON - 正常系', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.ERROR,
        timestamp: new Date('2025-06-22T15:30:45.123Z'),
        message: 'An error occurred',
        args: [{ userId: 123, action: 'login' }],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.timestamp).toBe('2025-06-22T15:30:45.123Z');
      expect(parsed.level).toBe('ERROR');
      expect(parsed.message).toBe('An error occurred');
      expect(parsed.args).toEqual([{ userId: 123, action: 'login' }]);
    });

    it('Then: should format multiple arguments as JSON array - 正常系', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.DEBUG,
        timestamp: new Date('2025-03-15T09:15:30.500Z'),
        message: 'Debug info',
        args: [
          { name: 'John Doe' },
          { age: 30 },
          ['item1', 'item2'],
        ],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.timestamp).toBe('2025-03-15T09:15:30.500Z');
      expect(parsed.level).toBe('DEBUG');
      expect(parsed.message).toBe('Debug info');
      expect(parsed.args).toEqual([
        { name: 'John Doe' },
        { age: 30 },
        ['item1', 'item2'],
      ]);
    });
  });

  describe('When: formatting with all log levels', () => {
    it('Then: should format correctly for all standard log levels - 正常系', () => {
      const baseMessage: Omit<AgLogMessage, 'logLevel'> = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        message: 'Test',
        args: [],
      };

      const testCases = [
        { level: AG_LOGLEVEL.FATAL, expected: 'FATAL' },
        { level: AG_LOGLEVEL.ERROR, expected: 'ERROR' },
        { level: AG_LOGLEVEL.WARN, expected: 'WARN' },
        { level: AG_LOGLEVEL.INFO, expected: 'INFO' },
        { level: AG_LOGLEVEL.DEBUG, expected: 'DEBUG' },
        { level: AG_LOGLEVEL.TRACE, expected: 'TRACE' },
      ];

      testCases.forEach(({ level, expected }) => {
        const result = JsonFormatter({ ...baseMessage, logLevel: level });
        const parsed = JSON.parse(result);
        expect(parsed.level).toBe(expected);
      });
    });

    it('Then: should format LOG level without level field - エッジケース', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.LOG,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Force output message',
        args: [],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.timestamp).toBe('2025-01-01T12:00:00.000Z');
      expect(parsed.level).toBeUndefined();
      expect(parsed.message).toBe('Force output message');
      expect(parsed.args).toBeUndefined();
    });
  });

  describe('When: formatting edge case inputs', () => {
    it('Then: should format correctly with empty message - エッジケース', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.WARN,
        timestamp: new Date('2025-12-31T23:59:59.999Z'),
        message: '',
        args: [{ warning: 'empty message' }],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.timestamp).toBe('2025-12-31T23:59:59.999Z');
      expect(parsed.level).toBe('WARN');
      expect(parsed.message).toBe('');
      expect(parsed.args).toEqual([{ warning: 'empty message' }]);
    });

    it('Then: should output valid JSON string without newlines - 正常系', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Test',
        args: [{ key: 'value' }],
      };

      const result = JsonFormatter(logMessage);

      expect(() => JSON.parse(result)).not.toThrow();
      expect(result).not.toContain('\n');
    });
  });
});

describe('Given: JsonFormatter with problematic inputs', () => {
  describe('When: processing circular references', () => {
    it('Then: should throw Converting circular structure to JSON error - 異常系', () => {
      const circularObj: { name: string; self?: unknown } = { name: 'test' };
      circularObj.self = circularObj;

      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'circular reference test',
        args: [circularObj],
      };

      expect(() => JsonFormatter(logMessage)).toThrow('Converting circular structure to JSON');
    });
  });

  describe('When: processing null/undefined arguments', () => {
    it('Then: should handle null arguments correctly - エッジケース', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'null test',
        args: [null, undefined, { prop: null }],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.args).toEqual([null, null, { prop: null }]);
    });

    it('Then: should handle undefined properties in objects - エッジケース', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.DEBUG,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'undefined properties test',
        args: [{ defined: 'value', undefined: undefined, nullValue: null }],
      };

      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);

      expect(parsed.args[0]).toEqual({ defined: 'value', nullValue: null });
      expect(parsed.args[0]).not.toHaveProperty('undefined');
    });
  });

  describe('When: processing large data structures', () => {
    it('Then: should handle deeply nested objects without error - エッジケース', () => {
      const createDeepObject = (depth: number): unknown => {
        if (depth === 0) { return { leaf: 'value' }; }
        return { level: depth, child: createDeepObject(depth - 1) };
      };

      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.DEBUG,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'deep object test',
        args: [createDeepObject(10)],
      };

      expect(() => JsonFormatter(logMessage)).not.toThrow();
      const result = JsonFormatter(logMessage);
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('Then: should handle large arrays without performance issues - エッジケース', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item-${i}` }));

      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'large array test',
        args: [largeArray],
      };

      expect(() => JsonFormatter(logMessage)).not.toThrow();
      const result = JsonFormatter(logMessage);
      const parsed = JSON.parse(result);
      expect(parsed.args[0]).toHaveLength(1000);
    });
  });
});
