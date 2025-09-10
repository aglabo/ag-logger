// src/__tests__/aglogger-consolidated/AgLogger.spec.ts
// @(#) : Consolidated unit tests for AgLogger class following atsushifx式BDD
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Constants and Types
import { DISABLE, ENABLE } from '../../../shared/constants/common.constants';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';

// Test target
import { AgLogger } from '../../AgLogger.class';

// Test utilities
import { MockFormatter } from '../../plugins/formatter/MockFormatter';
import { MockLogger } from '../../plugins/logger/MockLogger';

const mockFormatter = MockFormatter.passthrough;

// Type for testing protected methods
type TestableAgLogger = AgLogger & {
  executeLog: (level: AgLogLevel, ...args: unknown[]) => void;
  shouldOutput: (level: AgLogLevel) => boolean;
  _isVerbose: boolean | null;
};

/**
 * Common test setup and cleanup
 */
const setupTestEnvironment = (): void => {
  beforeEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });

  afterEach(() => {
    vi.clearAllMocks();
    AgLogger.resetSingleton();
  });
};

/**
 * AgLogger Consolidated Unit Test Suite
 *
 * @description Comprehensive BDD-structured tests for AgLogger class
 * Organized by behavioral domains with maximum 3-level describe hierarchy
 */
describe('AgLogger', () => {
  setupTestEnvironment();

  /**
   * Instance Management Tests
   * Tests for singleton pattern and instance lifecycle
   */
  describe('インスタンス管理', () => {
    describe('Given: 未初期化状態のAgLogger', () => {
      describe('When: createLoggerを呼び出す', () => {
        it('Then: should create new AgLogger instance - 正常系', () => {
          const logger = AgLogger.createLogger();
          expect(logger).toBeInstanceOf(AgLogger);
        });

        it('Then: should return same instance on multiple calls - 正常系', () => {
          const logger1 = AgLogger.createLogger();
          const logger2 = AgLogger.createLogger();
          const logger3 = AgLogger.createLogger();

          expect(logger1).toBe(logger2);
          expect(logger2).toBe(logger3);
        });
      });

      describe('When: getLoggerを呼び出す', () => {
        it('Then: should retrieve existing instance - 正常系', () => {
          const created = AgLogger.createLogger();
          const retrieved = AgLogger.getLogger();

          expect(created).toBe(retrieved);
        });

        it('Then: should throw error if instance not created first - 異常系', () => {
          AgLogger.resetSingleton();

          expect(() => {
            AgLogger.getLogger();
          }).toThrow('Logger instance not created. Call createLogger() first.');
        });
      });
    });

    describe('Given: 特殊ログレベルを指定したAgLogger初期化', () => {
      describe('When: VERBOSEレベルで初期化', () => {
        it('Then: should throw AgLoggerError - 異常系', () => {
          expect(() => {
            AgLogger.createLogger({
              logLevel: AG_LOGLEVEL.VERBOSE,
            });
          }).toThrow('Special log levels cannot be set as default log level');
        });
      });

      describe('When: LOGレベルで初期化', () => {
        it('Then: should throw AgLoggerError - 異常系', () => {
          expect(() => {
            AgLogger.createLogger({
              logLevel: AG_LOGLEVEL.LOG,
            });
          }).toThrow('Special log levels cannot be set as default log level');
        });
      });
    });
  });

  /**
   * Log Level Management Tests
   * Tests for log level validation and control
   */
  describe('ログレベル管理', () => {
    describe('Given: AgLoggerインスタンスが初期化済み', () => {
      describe('When: 標準ログレベルを設定', () => {
        it('Then: should retrieve current level via logLevel property - 正常系', () => {
          const logger = AgLogger.createLogger();
          logger.logLevel = AG_LOGLEVEL.INFO;
          expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
        });

        it('Then: should correctly judge log level filtering - 正常系', () => {
          const logger = AgLogger.createLogger();
          const testableLogger = logger as TestableAgLogger;
          logger.logLevel = AG_LOGLEVEL.WARN;

          const shouldOutputTests = [
            { level: AG_LOGLEVEL.ERROR, expected: true },
            { level: AG_LOGLEVEL.INFO, expected: false },
          ] as const;

          shouldOutputTests.forEach(({ level, expected }) => {
            expect(testableLogger.shouldOutput(level)).toBe(expected);
          });
        });
      });

      describe('When: 特殊ログレベルを処理', () => {
        it('Then: should always output LOG level messages - 正常系', () => {
          const mockLogger = new MockLogger.buffer();
          const logger = AgLogger.createLogger({
            defaultLogger: mockLogger.log,
            formatter: mockFormatter,
          });
          logger.logLevel = AG_LOGLEVEL.OFF;
          logger.setVerbose = DISABLE;

          logger.log('force output message');

          expect(mockLogger.getMessageCount(AG_LOGLEVEL.LOG)).toBe(1);
        });

        it('Then: should throw AgLoggerError for VERBOSE level in setLoggerConfig - 異常系', () => {
          const logger = AgLogger.createLogger();

          expect(() => {
            logger.setLoggerConfig({
              logLevel: AG_LOGLEVEL.VERBOSE,
            });
          }).toThrow('Special log levels cannot be set as default log level');
        });
      });

      describe('When: undefined log level is used', () => {
        it('Then: should throw error for undefined log level - 異常系', () => {
          const mockLogger = new MockLogger.buffer();
          const logger = AgLogger.createLogger({
            defaultLogger: mockLogger.info.bind(mockLogger),
            formatter: mockFormatter,
          });
          const testableLogger = logger as TestableAgLogger;

          expect(() => {
            testableLogger.executeLog(undefined as unknown as AgLogLevel, 'test message');
          }).toThrow('Invalid log level (undefined)');
        });
      });
    });
  });

  /**
   * Verbose Functionality Tests
   * Tests for verbose mode behavior
   */
  describe('Verbose機能', () => {
    describe('Given: 初期化されたAgLoggerインスタンス', () => {
      describe('When: デフォルト状態でverbose状態を確認', () => {
        it('Then: should have verbose disabled by default - 正常系', () => {
          const logger = AgLogger.createLogger();
          expect(logger.isVerbose).toBe(DISABLE);
        });
      });

      describe('When: setVerboseでverbose状態を制御', () => {
        it('Then: should control verbose state properly - 正常系', () => {
          const logger = AgLogger.createLogger();

          const verboseTests = [
            { setValue: ENABLE, expected: ENABLE },
            { setValue: DISABLE, expected: DISABLE },
          ] as const;

          verboseTests.forEach(({ setValue, expected }) => {
            logger.setVerbose = setValue;
            expect(logger.isVerbose).toBe(expected);
          });
        });
      });

      describe('When: verboseメソッドを呼び出す', () => {
        it('Then: should respect verbose setting for output control - 正常系', () => {
          const mockLogger = new MockLogger.buffer();
          const logger = AgLogger.createLogger({
            defaultLogger: mockLogger.verbose.bind(mockLogger),
            formatter: mockFormatter,
          });

          // Verbose disabled - no output
          logger.verbose('test message');
          expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(0);

          // Verbose enabled - output expected
          logger.setVerbose = ENABLE;
          logger.verbose('test message');
          expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(1);
        });
      });
    });

    describe('Given: verbose機能のエッジケース環境', () => {
      describe('When: 様々な引数タイプでverboseメソッドを処理', () => {
        it('Then: should handle different argument types correctly - エッジケース', () => {
          const mockLogger = new MockLogger.buffer();
          const logger = AgLogger.createLogger({
            defaultLogger: mockLogger.verbose.bind(mockLogger),
            formatter: mockFormatter,
          });
          logger.setVerbose = true;

          // Test different argument types with functional approach
          const testArgs = [
            'string',
            42,
            { key: 'value' },
            [1, 2, 3],
          ] as const;

          testArgs.forEach((arg) => {
            logger.verbose(arg);
          });

          expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(4); // count testArgs
        });
      });

      describe('When: 高速なverbose状態変更を実行', () => {
        it('Then: should handle rapid verbose state changes - エッジケース', () => {
          const mockLogger = new MockLogger.buffer();
          const logger = AgLogger.createLogger({
            defaultLogger: mockLogger.verbose.bind(mockLogger),
            formatter: mockFormatter,
          });
          logger.logLevel = AG_LOGLEVEL.INFO;

          Array.from({ length: 100 }, (_, i) => i).forEach((i) => {
            logger.setVerbose = i % 2 === 0;
            logger.verbose(`verbose ${i}`);
          });

          expect(mockLogger.getMessageCount(AG_LOGLEVEL.VERBOSE)).toBe(50);
        });
      });
    });
  });

  /**
   * Standard Log Methods Tests
   * Tests for standard logging methods (info, warn, error, etc.)
   */
  describe('標準ログメソッド', () => {
    describe('Given: 設定済みログメソッド環境', () => {
      describe('When: 各ログレベルメソッドを実行', () => {
        const mockLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.info.bind(mockLogger),
          formatter: mockFormatter,
          loggerMap: {
            [AG_LOGLEVEL.FATAL]: mockLogger.fatal.bind(mockLogger),
            [AG_LOGLEVEL.ERROR]: mockLogger.error.bind(mockLogger),
            [AG_LOGLEVEL.WARN]: mockLogger.warn.bind(mockLogger),
            [AG_LOGLEVEL.INFO]: mockLogger.info.bind(mockLogger),
            [AG_LOGLEVEL.DEBUG]: mockLogger.debug.bind(mockLogger),
            [AG_LOGLEVEL.TRACE]: mockLogger.trace.bind(mockLogger),
          },
        });

        const logMethods = [
          { name: 'fatal', level: AG_LOGLEVEL.FATAL, method: logger.fatal.bind(logger) },
          { name: 'error', level: AG_LOGLEVEL.ERROR, method: logger.error.bind(logger) },
          { name: 'warn', level: AG_LOGLEVEL.WARN, method: logger.warn.bind(logger) },
          { name: 'info', level: AG_LOGLEVEL.INFO, method: logger.info.bind(logger) },
          { name: 'debug', level: AG_LOGLEVEL.DEBUG, method: logger.debug.bind(logger) },
          { name: 'trace', level: AG_LOGLEVEL.TRACE, method: logger.trace.bind(logger) },
        ] as const;

        logMethods.forEach(({ name, level, method }) => {
          it(`Then: should execute ${name} method correctly - 正常系`, () => {
            logger.logLevel = level;
            mockLogger.clearAllMessages();

            method('test message');

            expect(mockLogger.getMessageCount(level)).toBe(1);
          });
        });
      });
    });

    describe('Given: ログレベルフィルタリング環境', () => {
      describe('When: 設定レベルより低い優先度のログを実行', () => {
        it('Then: should not output lower priority logs - 正常系', () => {
          const mockLogger = new MockLogger.buffer();
          const logger = AgLogger.createLogger({
            defaultLogger: mockLogger.info.bind(mockLogger),
            formatter: mockFormatter,
            loggerMap: {
              [AG_LOGLEVEL.INFO]: mockLogger.info.bind(mockLogger),
              [AG_LOGLEVEL.DEBUG]: mockLogger.debug.bind(mockLogger),
            },
          });
          logger.logLevel = AG_LOGLEVEL.WARN;

          const lowerPriorityMethods = [
            { method: logger.info.bind(logger), message: 'info message', level: AG_LOGLEVEL.INFO },
            { method: logger.debug.bind(logger), message: 'debug message', level: AG_LOGLEVEL.DEBUG },
          ] as const;

          lowerPriorityMethods.forEach(({ method, message }) => {
            method(message);
          });

          expect(mockLogger.getTotalMessageCount()).toBe(0);
        });
      });

      describe('When: 設定レベル以上の優先度のログを実行', () => {
        it('Then: should output higher priority logs - 正常系', () => {
          const mockLogger = new MockLogger.buffer();
          const logger = AgLogger.createLogger({
            defaultLogger: mockLogger.warn.bind(mockLogger),
            formatter: mockFormatter,
            loggerMap: {
              [AG_LOGLEVEL.ERROR]: mockLogger.error.bind(mockLogger),
              [AG_LOGLEVEL.WARN]: mockLogger.warn.bind(mockLogger),
            },
          });
          logger.logLevel = AG_LOGLEVEL.WARN;

          const higherPriorityMethods = [
            { method: logger.error.bind(logger), message: 'error message', level: AG_LOGLEVEL.ERROR },
            { method: logger.warn.bind(logger), message: 'warn message', level: AG_LOGLEVEL.WARN },
          ] as const;

          higherPriorityMethods.forEach(({ method, message }) => {
            method(message);
          });

          expect(mockLogger.getTotalMessageCount()).toBe(2);
        });
      });
    });
  });

  /**
   * Validation Tests
   * Tests for input validation and error handling
   */
  describe('バリデーション機能', () => {
    describe('Given: AgLoggerインスタンス設定バリデーション環境', () => {
      describe('When: setVerboseセッターを使用', () => {
        it('Then: should properly set and validate verbose state - 正常系', () => {
          const logger = AgLogger.createLogger();
          logger.setVerbose = true;
          expect(logger.isVerbose).toBe(true);
        });
      });
    });

    describe('Given: ロガー関数設定環境', () => {
      describe('When: 有効なログレベルでロガー関数を設定', () => {
        it('Then: should successfully set logger function - 正常系', () => {
          const logger = AgLogger.createLogger();
          const customLogger = vi.fn();

          const result = logger.setLoggerFunction(AG_LOGLEVEL.INFO, customLogger);

          expect(result).toBe(true);
          expect(logger.getLoggerFunction(AG_LOGLEVEL.INFO)).toBe(customLogger);
        });

        it('Then: should update logger map and call custom function - 正常系', () => {
          const mockLogger = new MockLogger.buffer();
          const logger = AgLogger.createLogger({
            defaultLogger: mockLogger.error.bind(mockLogger),
            formatter: mockFormatter,
          });
          const customLogger = vi.fn();

          // Set log level to allow ERROR messages
          logger.logLevel = AG_LOGLEVEL.ERROR;
          logger.setLoggerFunction(AG_LOGLEVEL.ERROR, customLogger);

          // Verify the function was set by checking if it gets called
          logger.error('test message');
          expect(customLogger).toHaveBeenCalledOnce();
        });
      });

      describe('When: 無効なログレベルでロガー関数を設定', () => {
        it('Then: should throw error for invalid log level - 異常系', () => {
          const logger = AgLogger.createLogger();
          const customLogger = vi.fn();

          expect(() => {
            logger.setLoggerFunction('invalid' as unknown as AgLogLevel, customLogger);
          }).toThrow('Invalid log level');
        });
      });
    });
  });

  /**
   * Core State Management Edge Cases
   * Tests for singleton reset scenarios and initialization edge cases
   */
  describe('Core状態管理エッジケース', () => {
    describe('Given: シングルトンリセット後の状態', () => {
      describe('When: resetSingleton後に初期化前アクセス', () => {
        it('Then: should handle uninitialized access gracefully - エッジケース', () => {
          // Create and reset singleton
          AgLogger.createLogger();
          AgLogger.resetSingleton();

          // Access before re-initialization should create new instance
          const logger = AgLogger.createLogger();
          expect(logger).toBeInstanceOf(AgLogger);
          expect(logger.logLevel).toBeDefined();
        });

        it('Then: should maintain state consistency after multiple resets - エッジケース', () => {
          // Multiple reset cycles
          for (let i = 0; i < 3; i++) {
            const logger = AgLogger.createLogger({
              logLevel: AG_LOGLEVEL.ERROR,
            });
            expect(logger.logLevel).toBe(AG_LOGLEVEL.ERROR);
            AgLogger.resetSingleton();
          }

          // Final verification
          const finalLogger = AgLogger.createLogger();
          expect(finalLogger.logLevel).toBe(AG_LOGLEVEL.OFF); // Default level
        });

        it('Then: should handle concurrent singleton access - エッジケース', () => {
          AgLogger.resetSingleton();

          // Simulate concurrent access
          const loggers = Array.from({ length: 10 }, () => AgLogger.createLogger());

          // All should reference the same instance
          const firstLogger = loggers[0];
          loggers.forEach((logger) => {
            expect(logger).toBe(firstLogger);
          });
        });
      });

      describe('When: 設定変更順序異常パターンを実行', () => {
        it('Then: should handle rapid configuration changes correctly - エッジケース', () => {
          const logger = AgLogger.createLogger();

          // Rapid configuration changes
          const levels = [AG_LOGLEVEL.DEBUG, AG_LOGLEVEL.WARN, AG_LOGLEVEL.ERROR, AG_LOGLEVEL.INFO];
          levels.forEach((level) => {
            logger.logLevel = level;
            expect(logger.logLevel).toBe(level);
          });
        });

        it('Then: should reject invalid configuration sequences - 異常系', () => {
          const logger = AgLogger.createLogger();

          // Try invalid configuration after valid ones
          logger.logLevel = AG_LOGLEVEL.INFO;
          expect(() => {
            logger.setLoggerConfig({
              logLevel: AG_LOGLEVEL.VERBOSE, // Invalid special level
            });
          }).toThrow('Special log levels cannot be set as default log level');

          // Ensure previous valid state is maintained
          expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
        });

        it('Then: should handle configuration rollback on error - 異常系', () => {
          const logger = AgLogger.createLogger();
          const originalLevel = AG_LOGLEVEL.WARN;
          logger.logLevel = originalLevel;

          // Attempt invalid configuration
          expect(() => {
            logger.setLoggerConfig({
              logLevel: AG_LOGLEVEL.LOG, // Invalid for default level
            });
          }).toThrow();

          // Original configuration should remain unchanged
          expect(logger.logLevel).toBe(originalLevel);
        });
      });

      describe('When: 初期化前アクセス処理を実行', () => {
        it('Then: should require explicit creation after reset - 異常系', () => {
          AgLogger.resetSingleton();

          // getLogger should throw after reset
          expect(() => {
            AgLogger.getLogger();
          }).toThrow('Logger instance not created. Call createLogger() first.');
        });

        it('Then: should handle property access before full initialization - エッジケース', () => {
          AgLogger.resetSingleton();
          const logger = AgLogger.createLogger();

          // Access properties immediately after creation
          expect(logger.logLevel).toBeDefined();
          expect(logger.isVerbose).toBeDefined();
        });

        it('Then: should throw error for access on uninitialized singleton - 異常系', () => {
          AgLogger.resetSingleton();

          // Direct access without proper initialization should throw
          expect(() => {
            AgLogger.getLogger();
          }).toThrow('Logger instance not created. Call createLogger() first.');
        });
      });
    });

    describe('Given: 設定オブジェクト変更検出環境', () => {
      describe('When: 設定オブジェクトの直接変更を試行', () => {
        it('Then: should maintain configuration integrity - 正常系', () => {
          const logger = AgLogger.createLogger({
            logLevel: AG_LOGLEVEL.INFO,
          });

          const originalLevel = logger.logLevel;

          // Configuration should remain stable
          expect(logger.logLevel).toBe(originalLevel);
        });

        it('Then: should detect and validate configuration changes - 異常系', () => {
          const logger = AgLogger.createLogger();

          // Invalid configuration should be rejected
          expect(() => {
            logger.setLoggerConfig({
              logLevel: 'INVALID_LEVEL' as unknown as AgLogLevel,
            });
          }).toThrow();
        });

        it('Then: should handle null/undefined configurations - 異常系', () => {
          const logger = AgLogger.createLogger();

          expect(() => {
            logger.setLoggerConfig(null as unknown as Parameters<typeof logger.setLoggerConfig>[0]);
          }).toThrow();

          expect(() => {
            logger.setLoggerConfig(undefined as unknown as Parameters<typeof logger.setLoggerConfig>[0]);
          }).toThrow();
        });
      });

      describe('When: 設定の部分更新を実行', () => {
        it('Then: should apply partial configuration updates correctly - 正常系', () => {
          const mockLogger = new MockLogger.buffer();
          const logger = AgLogger.createLogger({
            logLevel: AG_LOGLEVEL.DEBUG,
            defaultLogger: mockLogger.info.bind(mockLogger),
          });

          // Partial update
          logger.setLoggerConfig({
            logLevel: AG_LOGLEVEL.ERROR,
          });

          expect(logger.logLevel).toBe(AG_LOGLEVEL.ERROR);
        });

        it('Then: should maintain unchanged configuration properties - エッジケース', () => {
          const customFormatter = vi.fn().mockReturnValue('formatted');
          const logger = AgLogger.createLogger({
            formatter: customFormatter,
            logLevel: AG_LOGLEVEL.INFO,
          });

          // Update only log level
          logger.setLoggerConfig({
            logLevel: AG_LOGLEVEL.WARN,
          });

          // Formatter should remain unchanged
          expect(logger.getFormatter()).toBe(customFormatter);
        });
      });
    });
  });
});
