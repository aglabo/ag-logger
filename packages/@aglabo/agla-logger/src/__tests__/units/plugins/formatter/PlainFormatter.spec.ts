// src/plugins/formatter/__tests__/PlainFormatter.spec.ts
// @(#) : Unit tests for PlainFormatter plugin
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// vitest imports
import { describe, expect, it } from 'vitest';

// constants
import { AG_LOGLEVEL } from '../../../../../shared/types';
// types
import type { AgLogMessage } from '../../../../../shared/types/AgLogger.types';

// subject under test
import { PlainFormatter } from '../../../../plugins/formatter/PlainFormatter';

describe('Given: PlainFormatter with valid log message structures', () => {
  describe('When: formatting basic log messages', () => {
    it('Then: should format basic log message as plain text - 正常系', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Test message',
        args: [],
      };

      const result = PlainFormatter(logMessage);
      expect(result).toBe('2025-01-01T12:00:00Z [INFO] Test message');
    });

    it('Then: should format log message with arguments as plain text - 正常系', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.ERROR,
        timestamp: new Date('2025-06-22T15:30:45.123Z'),
        message: 'An error occurred',
        args: [{ userId: 123, action: 'login' }],
      };

      const result = PlainFormatter(logMessage);
      expect(result).toBe('2025-06-22T15:30:45Z [ERROR] An error occurred {"userId":123,"action":"login"}');
    });

    it('Then: should format multiple arguments as JSON strings - 正常系', () => {
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

      const result = PlainFormatter(logMessage);
      expect(result).toBe('2025-03-15T09:15:30Z [DEBUG] Debug info {"name":"John Doe"} {"age":30} ["item1","item2"]');
    });
  });

  describe('When: formatting with all log levels', () => {
    it('Then: should format correctly for all standard log levels - 正常系', () => {
      const baseMessage: Omit<AgLogMessage, 'logLevel'> = {
        timestamp: new Date('2025-01-01T00:00:00.000Z'),
        message: 'Test',
        args: [],
      };

      expect(PlainFormatter({ ...baseMessage, logLevel: AG_LOGLEVEL.FATAL }))
        .toBe('2025-01-01T00:00:00Z [FATAL] Test');
      expect(PlainFormatter({ ...baseMessage, logLevel: AG_LOGLEVEL.ERROR }))
        .toBe('2025-01-01T00:00:00Z [ERROR] Test');
      expect(PlainFormatter({ ...baseMessage, logLevel: AG_LOGLEVEL.WARN }))
        .toBe('2025-01-01T00:00:00Z [WARN] Test');
      expect(PlainFormatter({ ...baseMessage, logLevel: AG_LOGLEVEL.INFO }))
        .toBe('2025-01-01T00:00:00Z [INFO] Test');
      expect(PlainFormatter({ ...baseMessage, logLevel: AG_LOGLEVEL.DEBUG }))
        .toBe('2025-01-01T00:00:00Z [DEBUG] Test');
      expect(PlainFormatter({ ...baseMessage, logLevel: AG_LOGLEVEL.TRACE }))
        .toBe('2025-01-01T00:00:00Z [TRACE] Test');
    });

    it('Then: should format LOG level without brackets - エッジケース', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.LOG,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'Force output message',
        args: [],
      };

      const result = PlainFormatter(logMessage);
      expect(result).toBe('2025-01-01T12:00:00Z Force output message');
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

      const result = PlainFormatter(logMessage);
      expect(result).toBe('2025-12-31T23:59:59Z [WARN] {"warning":"empty message"}');
    });

    it('Then: should handle whitespace-only messages correctly - エッジケース', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: '   \t\n   ',
        args: [],
      };

      const result = PlainFormatter(logMessage);
      expect(result).toBe('2025-01-01T12:00:00Z [INFO]');
    });
  });
});

describe('Given: PlainFormatter with problematic inputs', () => {
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

      expect(() => PlainFormatter(logMessage)).toThrow('Converting circular structure to JSON');
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

      const result = PlainFormatter(logMessage);
      expect(result).toBe('2025-01-01T12:00:00Z [INFO] null test null undefined {"prop":null}');
    });

    it('Then: should handle undefined properties in objects - エッジケース', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.DEBUG,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'undefined properties test',
        args: [{ defined: 'value', undefined: undefined, nullValue: null }],
      };

      const result = PlainFormatter(logMessage);
      expect(result).toBe(
        '2025-01-01T12:00:00Z [DEBUG] undefined properties test {"defined":"value","nullValue":null}',
      );
    });
  });

  describe('When: processing special character arguments', () => {
    it('Then: should handle arguments with special characters - エッジケース', () => {
      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.WARN,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'special chars test',
        args: [{ text: 'Hello\n"World"\t\\Path' }],
      };

      const result = PlainFormatter(logMessage);
      expect(result).toBe('2025-01-01T12:00:00Z [WARN] special chars test {"text":"Hello\\n\\"World\\"\\t\\\\Path"}');
    });

    it('Then: should handle functions and symbols in arguments - エッジケース', () => {
      const testFunction = (): string => 'test';
      const testSymbol = Symbol('test');

      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.DEBUG,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'function and symbol test',
        args: [{ fn: testFunction, sym: testSymbol, date: new Date('2025-01-01T00:00:00.000Z') }],
      };

      const result = PlainFormatter(logMessage);
      expect(result).toContain('2025-01-01T12:00:00Z [DEBUG] function and symbol test');
      expect(result).toContain('"date":"2025-01-01T00:00:00.000Z"');
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
        args: [createDeepObject(5)],
      };

      expect(() => PlainFormatter(logMessage)).not.toThrow();
      const result = PlainFormatter(logMessage);
      expect(result).toContain('2025-01-01T12:00:00Z [DEBUG] deep object test');
      expect(result).toContain('"leaf":"value"');
    });

    it('Then: should handle large arrays without performance issues - エッジケース', () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => `item-${i}`);

      const logMessage: AgLogMessage = {
        logLevel: AG_LOGLEVEL.INFO,
        timestamp: new Date('2025-01-01T12:00:00.000Z'),
        message: 'large array test',
        args: [largeArray],
      };

      expect(() => PlainFormatter(logMessage)).not.toThrow();
      const result = PlainFormatter(logMessage);
      expect(result).toContain('2025-01-01T12:00:00Z [INFO] large array test');
      expect(result).toContain('"item-0"');
      expect(result).toContain('"item-99"');
    });
  });
});
