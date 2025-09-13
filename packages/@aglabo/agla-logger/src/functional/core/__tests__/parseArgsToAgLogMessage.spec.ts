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
describe('parseArgsToAgLogMessage', () => {
  describe('Given: parseArgsToAgLogMessage with basic functionality', () => {
    describe('When: basic message formatting is performed', () => {
      it('Then: should format basic message with level - 正常系', () => {
        const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test message');

        expect(result.level).toBe('INFO');
        expect(result.message).toBe('test message');
        expect(result.timestamp).toBeInstanceOf(Date);
        expect(result.args).toEqual([]);
        expect(Object.isFrozen(result)).toBe(true);
      });

      it('Then: should convert all log levels to string labels - 正常系', () => {
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

      it('Then: should separate message args from structured args - 正常系', () => {
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

  describe('Given: parseArgsToAgLogMessage with pure function properties', () => {
    describe('When: function immutability is tested', () => {
      it('Then: should not modify input arguments - 正常系', () => {
        const originalArgs = ['message', { data: 'test' }];
        const argsCopy = [...originalArgs];

        parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, ...originalArgs);

        expect(originalArgs).toEqual(argsCopy);
      });

      it('Then: should return frozen (immutable) objects - 正常系', () => {
        const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test');

        expect(Object.isFrozen(result)).toBe(true);
        expect(Object.isFrozen(result.args)).toBe(true);
      });

      it('Then: should be deterministic for same inputs (excluding timestamp) - 正常系', () => {
        const result1 = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test', { data: 'value' });
        const result2 = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test', { data: 'value' });

        expect(result1.level).toBe(result2.level);
        expect(result1.message).toBe(result2.message);
        expect(result1.args).toEqual(result2.args);
      });
    });
  });

  describe('Given: parseArgsToAgLogMessage with complex argument handling', () => {
    describe('When: mixed argument types are processed', () => {
      it('Then: should handle mixed primitive and object arguments - 正常系', () => {
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

      it('Then: should handle empty arguments - エッジケース', () => {
        const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO);

        expect(result.message).toBe('');
        expect(result.args).toEqual([]);
      });

      it('Then: should handle null and undefined arguments - 異常系', () => {
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

      it('Then: should handle empty string arguments - エッジケース', () => {
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

  describe('Given: parseArgsToAgLogMessage with circular reference handling', () => {
    describe('When: circular references are processed', () => {
      it('Then: should handle simple circular references gracefully - 異常系', () => {
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

      it('Then: should handle nested circular references - エッジケース', () => {
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

      it('Then: should handle array circular references - エッジケース', () => {
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

  describe('Given: parseArgsToAgLogMessage with large data handling', () => {
    describe('When: large data volumes are processed', () => {
      it('Then: should handle extremely long strings efficiently - エッジケース', () => {
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

      it('Then: should handle large object structures - エッジケース', () => {
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

      it('Then: should handle large array structures - エッジケース', () => {
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

  describe('Given: parseArgsToAgLogMessage with deep nesting handling', () => {
    describe('When: deeply nested structures are processed', () => {
      it('Then: should handle deeply nested objects - エッジケース', () => {
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

      it('Then: should handle deeply nested arrays - エッジケース', () => {
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

      it('Then: should handle mixed deep nesting (objects + arrays) - エッジケース', () => {
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

  describe('Given: parseArgsToAgLogMessage with timestamp handling', () => {
    describe('When: timestamp arguments are processed', () => {
      it('Then: should use provided ISO timestamp - 正常系', () => {
        const timestampStr = '2025-07-22T02:45:00.000Z';
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.INFO,
          timestampStr,
          'test message',
        );

        expect(result.timestamp).toEqual(new Date(timestampStr));
        expect(result.message).toBe('test message');
      });

      it('Then: should use current time if no timestamp provided - 正常系', () => {
        const before = new Date();
        const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, 'test message');
        const after = new Date();

        expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(result.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
        expect(result.message).toBe('test message');
      });

      it('Then: should treat invalid timestamp as regular string argument - 異常系', () => {
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.INFO,
          'not-a-timestamp',
          'test message',
        );

        expect(result.message).toBe('not-a-timestamp test message');
      });
    });

    describe('When: edge case timestamp formats are processed', () => {
      it('Then: should treat date-like words as regular strings - エッジケース', () => {
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

      it('Then: should treat partial date strings as regular strings - エッジケース', () => {
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

      it('Then: should treat ambiguous date-like strings as regular strings - 異常系', () => {
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

      it('Then: should treat numeric timestamp strings as regular strings - エッジケース', () => {
        const numericTimestamp = '1640995200000';
        const result = parseArgsToAgLogMessage(
          AG_LOGLEVEL.INFO,
          numericTimestamp,
          'unix time test',
        );

        expect(result.message).toBe(`${numericTimestamp} unix time test`);
        expect(result.timestamp).toBeInstanceOf(Date);
      });

      it('Then: should treat invalid numeric strings as regular strings - 異常系', () => {
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

      it('Then: should handle whitespace-only timestamp candidates - エッジケース', () => {
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

      it('Then: should handle timezone-aware timestamps correctly - 正常系', () => {
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

      it('Then: should reject malformed ISO strings as timestamps - 異常系', () => {
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

  describe('Given: parseArgsToAgLogMessage with Unicode handling', () => {
    describe('When: Unicode and emoji characters are processed', () => {
      it('Then: should handle standard emoji characters correctly - 正常系', () => {
        const emojiMessage = '✅ Success! 🎉 Celebration time!';
        const result = parseArgsToAgLogMessage(AG_LOGLEVEL.INFO, emojiMessage);

        expect(result.level).toBe('INFO');
        expect(result.message).toBe('✅ Success! 🎉 Celebration time!');
        expect(result.args).toEqual([]);
        expect(result.message.length).toBe(31); // Verify emoji length preservation
      });

      it('Then: should preserve Unicode sequences intact - 正常系', () => {
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

      it('Then: should handle malformed Unicode sequences - 異常系', () => {
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

      it('Then: should handle extremely wide Unicode characters - エッジケース', () => {
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

      it('Then: should handle Unicode in object properties - エッジケース', () => {
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

      it('Then: should handle zero-width and invisible Unicode characters - エッジケース', () => {
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

      it('Then: should handle Unicode normalization edge cases - エッジケース', () => {
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

      it('Then: should handle extremely long Unicode strings - エッジケース', () => {
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
});
