// src/functional/core/__tests__/parseArgsToAgLogMessage.spec.ts
// @(#) : Unit tests for parseArgsToAgLogMessage pure function
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../../shared/types';
import { parseArgsToAgLogMessage } from '../parseArgsToAgLogMessage';

/**
 * Unit tests for the parseArgsToAgLogMessage pure function.
 * This function should replace AgLoggerGetMessage with a pure functional approach.
 */
describe('Feature: Basic functionality', () => {
  describe('When: basic message formatting is performed', () => {
    it('Then [正常]: format basic message with level', () => {
      const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test message');

      expect(result.level).toBe('INFO');
      expect(result.message).toBe('test message');
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.args).toEqual([]);
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('Then [正常]: convert all log levels to labels', () => {
      const fatalResult = parseArgsToAgLogMessage(AG_LOGLEVEL.FATAL, 'fatal error');
      const errorResult = parseArgsToAgLogMessage(AG_LOGLEVEL.ERROR, 'error message');
      const warnResult = parseArgsToAgLogMessage(AG_LOGLEVEL.WARN, 'warning message');
      const infoResult = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'info message');
      const debugResult = parseArgsToAgLogMessage(AG_LOGLEVEL.DEBUG, 'debug message');
      const traceResult = parseArgsToAgLogMessage(AG_LOGLEVEL.TRACE, 'trace message');

      expect(fatalResult.level).toBe('FATAL');
      expect(errorResult.level).toBe('ERROR');
      expect(warnResult.level).toBe('WARN');
      expect(infoResult.level).toBe('INFO');
      expect(debugResult.level).toBe('DEBUG');
      expect(traceResult.level).toBe('TRACE');
    });

    it('Then [正常]: separate message args from structured args', () => {
      const userData = { id: 123, name: 'John' };
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.ERROR,
        'User error',
        userData,
        'occurred',
        42,
      );

      expect(result.level).toBe('ERROR');
      expect(result.message).toBe('User error occurred 42');
      expect(result.args).toEqual([userData]);
      expect(Object.isFrozen(result.args)).toBe(true);
    });
  });
});

describe('Feature: Pure function properties', () => {
  describe('When: function immutability is tested', () => {
    it('Then [正常]: not modify input arguments', () => {
      const originalArgs = ['message', { data: 'test' }];
      const argsCopy = [...originalArgs];

      parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, ...originalArgs);

      expect(originalArgs).toEqual(argsCopy);
    });

    it('Then [正常]: return frozen objects', () => {
      const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test');

      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.args)).toBe(true);
    });

    it('Then [正常]: deterministic for same inputs (excl. timestamp)', () => {
      const result1 = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test', { data: 'value' });
      const result2 = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test', { data: 'value' });

      expect(result1.level).toBe(result2.level);
      expect(result1.message).toBe(result2.message);
      expect(result1.args).toEqual(result2.args);
    });
  });
});

describe('Feature: Complex argument handling', () => {
  describe('When: mixed argument types are processed', () => {
    it('Then [正常]: handle mixed primitive and object args', () => {
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.WARN,
        'Processing',
        123,
        'items',
        { status: 'active' },
        true,
      );

      expect(result.message).toBe('Processing 123 items true');
      expect(result.args).toEqual([{ status: 'active' }]);
    });

    it('Then [エッジ]: handle empty arguments', () => {
      const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO);

      expect(result.message).toBe('');
      expect(result.args).toEqual([]);
    });

    it('Then [異常]: handle null and undefined arguments', () => {
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.DEBUG,
        'Testing',
        null,
        undefined,
        'values',
      );

      expect(result.message).toBe('Testing values');
      expect(result.args).toEqual([null, undefined]);
    });

    it('Then [エッジ]: handle empty string arguments', () => {
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.WARN,
        'Empty structures test',
        {},
        [],
        '',
      );

      expect(result.message).toBe('Empty structures test');
      expect(result.args).toEqual([{}, []]);
    });
  });
});

describe('Feature: Circular reference handling', () => {
  describe('When: circular references are processed', () => {
    it('Then [異常]: handle simple circular object', () => {
      const circularObj = { name: 'circular' } as Record<string, unknown>;
      circularObj.self = circularObj;

      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.ERROR,
        'Circular object detected',
        circularObj,
      );

      expect(result.level).toBe('ERROR');
      expect(result.message).toBe('Circular object detected');
      expect(result.args).toHaveLength(1);
      expect(result.args[0]).toBe(circularObj);
    });

    it('Then [エッジ]: handle nested circular refs', () => {
      const parent = { name: 'parent' } as Record<string, unknown>;
      const child = { name: 'child', parent } as Record<string, unknown>;
      parent.child = child;

      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.WARN,
        'Nested circular structure',
        parent,
        child,
      );

      expect(result.message).toBe('Nested circular structure');
      expect(result.args).toHaveLength(2);
      expect(result.args[0]).toBe(parent);
      expect(result.args[1]).toBe(child);
    });

    it('Then [エッジ]: handle circular arrays', () => {
      const circularArray: unknown[] = ['item1', 'item2'];
      circularArray.push(circularArray);

      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.DEBUG,
        'Circular array test',
        circularArray,
      );

      expect(result.message).toBe('Circular array test');
      expect(result.args).toHaveLength(1);
      expect(result.args[0]).toBe(circularArray);
    });
  });
});

describe('Feature: Large data handling', () => {
  describe('When: large data volumes are processed', () => {
    it('Then [エッジ]: handle extremely long strings', () => {
      const largeString = 'A'.repeat(100000); // 100KB string
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.INFO,
        'Large string:',
        largeString,
      );

      expect(result.message).toBe(`Large string: ${largeString}`);
      expect(result.args).toEqual([]);
      expect(result.message.length).toBeGreaterThan(100000);
    });

    it('Then [エッジ]: handle large object structures', () => {
      const largeObject: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`key${i}`] = `value${i}`;
      }

      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.WARN,
        'Large object processing',
        largeObject,
      );

      expect(result.message).toBe('Large object processing');
      expect(result.args).toHaveLength(1);
      expect(Object.keys(result.args[0] as Record<string, string>)).toHaveLength(1000);
    });

    it('Then [エッジ]: handle large arrays', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);

      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.TRACE,
        'Large array test',
        largeArray,
      );

      expect(result.message).toBe('Large array test');
      expect(result.args).toHaveLength(1);
      expect((result.args[0] as number[]).length).toBe(10000);
    });
  });
});

describe('Feature: Deep nesting handling', () => {
  describe('When: deeply nested structures are processed', () => {
    it('Then [エッジ]: handle deeply nested objects', () => {
      let deepObj: Record<string, unknown> = { level: 0 };
      for (let i = 1; i < 100; i++) {
        deepObj = { level: i, nested: deepObj };
      }

      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.ERROR,
        'Deep nesting test',
        deepObj,
      );

      expect(result.message).toBe('Deep nesting test');
      expect(result.args).toHaveLength(1);
      expect((result.args[0] as Record<string, unknown>).level).toBe(99);
    });

    it('Then [エッジ]: handle deeply nested arrays', () => {
      let deepArray: unknown = ['base'];
      for (let i = 0; i < 50; i++) {
        deepArray = [i, deepArray];
      }

      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.DEBUG,
        'Deep array nesting',
        deepArray,
      );

      expect(result.message).toBe('Deep array nesting');
      expect(result.args).toHaveLength(1);
      expect(Array.isArray(result.args[0])).toBe(true);
    });

    it('Then [エッジ]: handle mixed deep nesting (objects + arrays)', () => {
      const mixedDeep = { arrays: [] as Array<{ level: number; data: string[] }> };
      for (let i = 0; i < 20; i++) {
        mixedDeep.arrays.push({
          level: i,
          data: Array(i + 1).fill(`item${i}`) as string[],
        });
      }

      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.INFO,
        'Mixed deep structure',
        mixedDeep,
      );

      expect(result.message).toBe('Mixed deep structure');
      expect(result.args).toHaveLength(1);
      expect((result.args[0] as typeof mixedDeep).arrays).toHaveLength(20);
    });
  });
});

describe('Feature: Timestamp handling', () => {
  describe('When: timestamp arguments are processed', () => {
    it('Then [正常]: use provided ISO timestamp', () => {
      const timestampStr = '2025-07-22T02:45:00.000Z';
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.INFO,
        timestampStr,
        'test message',
      );

      expect(result.timestamp).toEqual(new Date(timestampStr));
      expect(result.message).toBe('test message');
    });

    it('Then [正常]: use current time if no timestamp provided', () => {
      const before = new Date();
      const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test message');
      const after = new Date();

      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(result.message).toBe('test message');
    });

    it('Then [異常]: treat invalid timestamp as regular string argument', () => {
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.INFO,
        'not-a-timestamp',
        'test message',
      );

      expect(result.message).toBe('not-a-timestamp test message');
    });
  });

  describe('When: edge case timestamp formats are processed', () => {
    it('Then [エッジ]: treat date-like words as regular strings', () => {
      const dateWords = ['today', 'now', 'yesterday', 'tomorrow'];

      dateWords.forEach((word) => {
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.INFO,
          word,
          'is a day',
        );

        expect(result.message).toBe(`${word} is a day`);
        expect(result.timestamp).toBeInstanceOf(Date);
      });
    });

    it('Then [エッジ]: treat partial date strings as regular strings', () => {
      const testCases = [
        'Jan',
        'January',
        'Mon',
        'Monday',
        '2025',
        'Dec 25',
        '25/12',
        '12/25',
      ];

      testCases.forEach((dateStr) => {
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.INFO,
          dateStr,
          'test',
        );

        expect(result.message).toBe(`${dateStr} test`);
      });
    });

    it('Then [異常]: treat ambiguous date-like strings as regular strings', () => {
      const ambiguousStrings = [
        '01/02/03',
        '1/1/1',
        '99/99/99',
        '13/25/2025',
        '2025-13-01',
        '2025-01-32',
      ];

      ambiguousStrings.forEach((dateStr) => {
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.WARN,
          dateStr,
          'might be date',
        );

        expect(result.message).toBe(`${dateStr} might be date`);
      });
    });

    it('Then [エッジ]: treat numeric timestamp strings as regular strings', () => {
      const numericTimestamp = '1640995200000';
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.INFO,
        numericTimestamp,
        'unix time test',
      );

      expect(result.message).toBe(`${numericTimestamp} unix time test`);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('Then [異常]: treat invalid numeric strings as regular strings', () => {
      const invalidNumbers = ['NaN', 'Infinity', '-Infinity', '1.5.3', '1e999'];

      invalidNumbers.forEach((numStr) => {
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.ERROR,
          numStr,
          'not a number',
        );

        expect(result.message).toBe(`${numStr} not a number`);
      });
    });

    it('Then [エッジ]: handle whitespace-only timestamp candidates', () => {
      const whitespaceStrings = ['', ' ', '\t', '\n', '   ', '\t\n '];

      whitespaceStrings.forEach((wsStr) => {
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.TRACE,
          wsStr,
          'whitespace test',
        );

        if (wsStr.trim() === '') {
          expect(result.message).toBe('whitespace test');
        } else {
          expect(result.message).toBe(`${wsStr} whitespace test`);
        }
      });
    });

    it('Then [正常]: handle timezone-aware timestamps correctly', () => {
      const timezoneTimestamps = [
        '2025-07-22T02:45:00+09:00', // JST
        '2025-07-22T02:45:00-05:00', // EST
        '2025-07-22T02:45:00Z', // UTC
      ];

      timezoneTimestamps.forEach((tzTimestamp) => {
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.INFO,
          tzTimestamp,
          'timezone test',
        );

        expect(result.timestamp).toEqual(new Date(tzTimestamp));
        expect(result.message).toBe('timezone test');
      });
    });

    it('Then [異常]: reject malformed ISO strings as timestamps', () => {
      const malformedISO = [
        '2025-07-22T25:45:00.000Z', // Invalid hour
        '2025-07-22T02:60:00.000Z', // Invalid minute
        '2025-07-22T02:45:60.000Z', // Invalid second
        '2025-13-22T02:45:00.000Z', // Invalid month
        '2025-07-32T02:45:00.000Z', // Invalid day
        '2025-07-22 02:45:00.000Z', // Missing 'T'
        '2025/07/22T02:45:00.000Z', // Wrong date separator
      ];

      malformedISO.forEach((isoStr) => {
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.ERROR,
          isoStr,
          'malformed ISO',
        );

        expect(result.message).toBe(`${isoStr} malformed ISO`);
      });
    });
  });
});

describe('Feature: Unicode handling', () => {
  describe('When: Unicode and emoji characters are processed', () => {
    it('Then [正常]: handle standard emoji characters correctly', () => {
      const emojiMessage = '✅ Success! 🎉 Celebration time!';
      const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, emojiMessage);

      expect(result.level).toBe('INFO');
      expect(result.message).toBe('✅ Success! 🎉 Celebration time!');
      expect(result.args).toEqual([]);
      expect(result.message.length).toBe(31); // Verify emoji length preservation
    });

    it('Then [正常]: preserve Unicode sequences intact', () => {
      const unicodeMessage = 'こんにちは 🌍 Hello 世界 🚀';
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.INFO,
        unicodeMessage,
        { user: 'テスト' },
      );

      expect(result.message).toBe('こんにちは 🌍 Hello 世界 🚀');
      expect(result.args).toEqual([{ user: 'テスト' }]);

      // Verify Japanese characters are preserved
      expect(result.message).toContain('こんにちは');
      expect(result.message).toContain('世界');
      expect(result.args[0]).toHaveProperty('user', 'テスト');
    });

    it('Then [異常]: handle malformed Unicode sequences', () => {
      // Create malformed Unicode by using surrogate pairs incorrectly
      const malformedUnicode = '\uD800\uD800'; // Two high surrogates (invalid)
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.WARN,
        'Processing',
        malformedUnicode,
        'data',
      );

      expect(result.level).toBe('WARN');
      expect(result.message).toBe(`Processing ${malformedUnicode} data`);
      expect(result.args).toEqual([]);

      // Verify the malformed sequence is still included but handled gracefully
      expect(result.message.length).toBeGreaterThan('Processing  data'.length);
    });

    it('Then [エッジ]: handle extremely wide Unicode characters', () => {
      // Test with wide Unicode characters (mathematical symbols, ancient scripts)
      const wideCharacters = '𝕏 𝒳 𝐗 𝓧 𝔛'; // Mathematical script variations of X
      const emojiCombinations = '👨‍👩‍👧‍👦 👍🏽 🏴‍☠️'; // Family, skin tone, flag sequences
      const ancientScript = '𒀀𒀁𒀂'; // Cuneiform characters

      const complexMessage = `${wideCharacters} ${emojiCombinations} ${ancientScript}`;
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.DEBUG,
        'Unicode test:',
        complexMessage,
        'complete',
      );

      expect(result.message).toBe(`Unicode test: ${complexMessage} complete`);
      expect(result.args).toEqual([]);

      // Verify all character types are preserved
      expect(result.message).toContain('𝕏');
      expect(result.message).toContain('👨‍👩‍👧‍👦');
      expect(result.message).toContain('𒀀');
    });

    it('Then [エッジ]: handle Unicode in object properties', () => {
      const unicodeObject = {
        '名前': 'テスト',
        '🔑': 'key-value',
        'नाम': 'परीक्षण', // Hindi
        '🌟emoji': '⭐value',
      };

      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.INFO,
        'Unicode object test',
        unicodeObject,
      );

      expect(result.message).toBe('Unicode object test');
      expect(result.args).toEqual([unicodeObject]);
      expect(result.args[0]).toHaveProperty('名前', 'テスト');
      expect(result.args[0]).toHaveProperty('🔑', 'key-value');
      expect(result.args[0]).toHaveProperty('नाम', 'परीक्षण');
      expect(result.args[0]).toHaveProperty('🌟emoji', '⭐value');
    });

    it('Then [エッジ]: handle zero-width and invisible Unicode characters', () => {
      // Test with zero-width characters that might affect string processing
      const invisibleChars = 'Hello\u200B\u200C\u200DWorld'; // Zero-width space, non-joiner, joiner
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.TRACE,
        invisibleChars,
        'with invisible chars',
      );

      expect(result.message).toBe('Hello\u200B\u200C\u200DWorld with invisible chars');
      expect(result.message.length).toBeGreaterThan('HelloWorld with invisible chars'.length);
    });

    it('Then [エッジ]: handle Unicode normalization edge cases', () => {
      // Test characters that can be represented in multiple Unicode forms
      const composed = 'é'; // Single composed character (U+00E9)
      const decomposed = 'e\u0301'; // Base + combining acute accent

      const result1 = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'Composed:', composed);
      const result2 = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'Decomposed:', decomposed);

      expect(result1.message).toBe(`Composed: ${composed}`);
      expect(result2.message).toBe(`Decomposed: ${decomposed}`);

      // They should have different byte lengths but both preserve their Unicode form
      expect(composed.length).toBe(1);
      expect(decomposed.length).toBe(2);

      // Verify that both are correctly included in messages
      expect(result1.message.includes(composed)).toBe(true);
      expect(result2.message.includes(decomposed)).toBe(true);

      // Verify that we preserve the exact Unicode representation
      expect(result1.message.charAt(result1.message.length - 1)).toBe(composed);
    });

    it('Then [エッジ]: handle extremely long Unicode strings', () => {
      // Create a very long Unicode string
      const longUnicodeString = '🎭'.repeat(100) + 'テスト'.repeat(50);
      const result = parseArgsToAgLogMessage(
        AG_LOGLEVEL.WARN,
        'Long string:',
        longUnicodeString,
      );

      expect(result.message).toBe(`Long string: ${longUnicodeString}`);
      expect(result.message.length).toBeGreaterThan(300); // Verify it's actually long
      expect(result.args).toEqual([]);
    });
  });
});
