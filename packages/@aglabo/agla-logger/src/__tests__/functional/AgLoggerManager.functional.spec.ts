// src/__tests__/AgLoggerManager.spec.ts
// @(#) : Unit tests for AgLoggerManager class (atsushifx-style BDD)
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク - テストの実行、アサーション、モック機能を提供
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// テスト対象 - AgLoggerManagerクラスのシングルトン実装
import { AgLoggerManager } from '../../AgLoggerManager.class';
// AgLoggerクラス - 参照比較のため
import { AgLogger } from '../../AgLogger.class';
// 型定義 - 委譲テスト用
import type { AgLoggerFunction, AgLoggerMap, AgLoggerOptions } from '../../../shared/types/AgLogger.interface';
import { AG_LOGLEVEL } from '../../../shared/types/AgLogLevel.types';

/**
 * AgLoggerManager仕様準拠BDDテストスイート
 *
 * @description atsushifx式BDD厳格プロセスに従った実装
 * 仕様書: docs/specs/refactor-agLoggerManager.spec.md に基づく
 *
 * @testType Unit Test (BDD)
 * @testTarget AgLoggerManager Class
 */
describe('AgLoggerManager', () => {
  /**
   * テスト前の初期化 - シングルトンリセット
   */
  beforeEach(() => {
    AgLoggerManager.resetSingleton();
  });

  /**
   * テスト後のクリーンアップ - シングルトンリセット
   */
  afterEach(() => {
    AgLoggerManager.resetSingleton();
  });

  /**
   * カテゴリ1: 初期化ガード
   *
   * @description 未初期化状態でのエラー処理と二重初期化防止
   */
  describe('初期化ガード', () => {
    describe('Given: 未初期化状態のAgLoggerManager', () => {
      describe('When: getManagerを呼び出す', () => {
        it('Then: should throw error for uninitialized access - 異常系', () => {
          expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
        });
      });
    });

    describe('Given: 初期化済みAgLoggerManager', () => {
      describe('When: createManagerを再度呼び出す', () => {
        it('Then: should throw error for duplicate initialization - 異常系', () => {
          AgLoggerManager.createManager();
          expect(() => AgLoggerManager.createManager()).toThrow(/already created/i);
        });
      });

      describe('When: 初期化後にgetManagerを呼び出す', () => {
        it('Then: should return same reference as created manager - 正常系', () => {
          const manager1 = AgLoggerManager.createManager();
          const manager2 = AgLoggerManager.getManager();
          expect(manager1).toBe(manager2);
        });
      });
    });
  });

  /**
   * カテゴリ2: Logger の生成・取得
   *
   * @description AgLoggerインスタンスの生成と取得機能
   */
  describe('Logger の生成・取得', () => {
    describe('Given: 初期化されたAgLoggerManager', () => {
      describe('When: getLoggerを呼び出す', () => {
        it('Then: should return defined logger instance - 正常系', () => {
          const manager = AgLoggerManager.createManager();
          const logger = manager.getLogger();
          expect(logger).toBeDefined();
        });

        it('Then: should return same reference as AgLogger.getLogger - 正常系', () => {
          AgLoggerManager.createManager();
          const manager = AgLoggerManager.getManager();
          const managerLogger = manager.getLogger();
          const directLogger = AgLogger.getLogger();
          expect(managerLogger).toBe(directLogger);
        });
      });
    });

    describe('Given: 未初期化状態のAgLoggerManager', () => {
      describe('When: getLoggerアクセスを試行', () => {
        it('Then: should throw error for uninitialized access - 異常系', () => {
          AgLoggerManager.resetSingleton(); // Ensure no instance exists
          expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
        });
      });
    });
  });

  /**
   * カテゴリ3: ロガーインスタンス注入
   *
   * @description setLoggerメソッドによる外部インスタンス注入機能
   */
  describe('ロガーインスタンス注入', () => {
    describe('Given: クリーンな状態でのAgLoggerManager', () => {
      describe('When: createManagerでマネージャーを作成', () => {
        it('Then: should successfully create manager with logger - 正常系', () => {
          AgLoggerManager.resetSingleton(); // Ensure clean state

          expect(() => {
            AgLoggerManager.createManager(); // Creates manager with logger
            // setLogger would throw because manager already has a logger
          }).not.toThrow();
        });

        it('Then: should return logger instance after creation - 正常系', () => {
          AgLoggerManager.resetSingleton(); // Ensure clean state

          const manager = AgLoggerManager.createManager();
          const retrievedLogger = manager.getLogger();
          expect(retrievedLogger).toBeInstanceOf(AgLogger);
        });
      });
    });

    describe('Given: 初期化済みAgLoggerManager', () => {
      describe('When: setLoggerで外部ロガーを注入を試行', () => {
        it('Then: should throw error for already initialized manager - 異常系', () => {
          const externalLogger = AgLogger.createLogger();
          AgLoggerManager.resetSingleton(); // Ensure clean state

          const manager = AgLoggerManager.createManager(); // Initialize manager with logger

          expect(() => manager.setLogger(externalLogger)).toThrow(/already initialized/i);
        });
      });
    });
  });

  /**
   * カテゴリ4: 廃棄（テスト専用API）
   *
   * @description resetSingleton等のテスト専用API動作
   */
  describe('廃棄（テスト専用API）', () => {
    describe('Given: 初期化済みAgLoggerManager', () => {
      describe('When: resetSingleton後にgetManagerを呼び出す', () => {
        it('Then: should throw error for disposed manager access - 正常系', () => {
          AgLoggerManager.createManager();
          AgLoggerManager.resetSingleton();

          expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
        });
      });

      describe('When: resetSingleton後にcreateManagerを呼び出す', () => {
        it('Then: should allow new manager creation after disposal - 正常系', () => {
          AgLoggerManager.createManager();
          AgLoggerManager.resetSingleton();

          expect(() => {
            const manager = AgLoggerManager.createManager();
            expect(manager).toBeDefined();
          }).not.toThrow();
        });
      });
    });
  });

  /**
   * カテゴリ5: 委譲の成立（インタラクション）
   *
   * @description bindLoggerFunction等の委譲メソッドの動作
   */
  describe('委譲の成立（インタラクション）', () => {
    describe('Given: 初期化済みAgLoggerManagerと委譲対象メソッド', () => {
      describe('When: bindLoggerFunctionを呼び出す', () => {
        it('Then: should call AgLogger.setLoggerFunction once - 正常系', () => {
          const manager = AgLoggerManager.createManager();
          const logger = manager.getLogger();
          const mockFunction: AgLoggerFunction = vi.fn();

          // AgLoggerのsetLoggerFunctionメソッドをスパイ
          const setLoggerFunctionSpy = vi.spyOn(logger, 'setLoggerFunction');

          manager.bindLoggerFunction(AG_LOGLEVEL.INFO, mockFunction);

          expect(setLoggerFunctionSpy).toHaveBeenCalledOnce();
          expect(setLoggerFunctionSpy).toHaveBeenCalledWith(AG_LOGLEVEL.INFO, mockFunction);
        });
      });

      describe('When: updateLoggerMapを呼び出す', () => {
        it('Then: should call AgLogger.setLoggerConfig with loggerMap - 正常系', () => {
          const manager = AgLoggerManager.createManager();
          const logger = manager.getLogger();
          const mockLoggerMap: Partial<AgLoggerMap<AgLoggerFunction>> = {
            [AG_LOGLEVEL.ERROR]: vi.fn(),
            [AG_LOGLEVEL.WARN]: vi.fn(),
          };

          // AgLoggerのsetLoggerConfigメソッドをスパイ
          const setLoggerConfigSpy = vi.spyOn(logger, 'setLoggerConfig');

          manager.updateLoggerMap(mockLoggerMap);

          expect(setLoggerConfigSpy).toHaveBeenCalledOnce();
          expect(setLoggerConfigSpy).toHaveBeenCalledWith({ loggerMap: mockLoggerMap });
        });
      });

      describe('When: setLoggerConfigを呼び出す', () => {
        it('Then: should delegate to AgLogger.setLoggerConfig - 正常系', () => {
          const manager = AgLoggerManager.createManager();
          const logger = manager.getLogger();
          const mockOptions = { logLevel: AG_LOGLEVEL.DEBUG };

          // AgLoggerのsetLoggerConfigメソッドをスパイ
          const setLoggerConfigSpy = vi.spyOn(logger, 'setLoggerConfig');

          manager.setLoggerConfig(mockOptions);

          expect(setLoggerConfigSpy).toHaveBeenCalledOnce();
          expect(setLoggerConfigSpy).toHaveBeenCalledWith(mockOptions);
        });
      });

      describe('When: removeLoggerFunctionを呼び出す', () => {
        it('Then: should call AgLogger.setLoggerFunction with NullLogger - 正常系', () => {
          const manager = AgLoggerManager.createManager();
          const logger = manager.getLogger();

          // AgLoggerのsetLoggerFunctionメソッドをスパイ
          const setLoggerFunctionSpy = vi.spyOn(logger, 'setLoggerFunction');

          manager.removeLoggerFunction(AG_LOGLEVEL.INFO);

          expect(setLoggerFunctionSpy).toHaveBeenCalledOnce();
          // NullLoggerで置換されることを確認
          expect(setLoggerFunctionSpy).toHaveBeenCalledWith(AG_LOGLEVEL.INFO, expect.any(Function));
        });
      });
    });
  });

  /**
   * カテゴリ6: スレッショルド
   *
   * @description 例外メッセージの正規表現テスト（仕様書120行目準拠）
   */
  describe('スレッショルド', () => {
    describe('Given: 未初期化状態のAgLoggerManager', () => {
      describe('When: getManagerを呼び出す', () => {
        it('Then: should throw error message matching /not created/i - 異常系', () => {
          expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
        });
      });
    });
  });

  /**
   * Core State Management Edge Cases
   * Tests for Manager-Logger state synchronization and edge cases
   */
  describe('Manager状態管理エッジケース', () => {
    describe('Given: Manager-Logger状態不整合シナリオ', () => {
      describe('When: 複数のマネージャー操作を並行実行', () => {
        it('Then: should maintain state consistency under concurrent operations - エッジケース', () => {
          const manager = AgLoggerManager.createManager();
          const logger = manager.getLogger();

          // Simulate concurrent state changes
          const operations = [
            () => manager.setLoggerConfig({ logLevel: AG_LOGLEVEL.DEBUG }),
            () => manager.bindLoggerFunction(AG_LOGLEVEL.INFO, vi.fn()),
            () => manager.removeLoggerFunction(AG_LOGLEVEL.WARN),
          ];

          // Execute operations in sequence (simulating concurrent access patterns)
          operations.forEach((op) => {
            expect(() => op()).not.toThrow();
          });

          // Verify final state consistency
          expect(logger.logLevel).toBe(AG_LOGLEVEL.DEBUG);
        });
      });

      describe('When: Manager破棄後の状態確認', () => {
        it('Then: should handle post-disposal access correctly - エッジケース', () => {
          // Create manager and logger reference
          const manager = AgLoggerManager.createManager();
          const loggerRef = manager.getLogger();

          // Dispose manager
          AgLoggerManager.resetSingleton();

          // Logger reference should still be functional
          expect(() => {
            loggerRef.info('test message after manager disposal');
          }).not.toThrow();

          // But manager access should fail
          expect(() => AgLoggerManager.getManager()).toThrow(/not created/i);
        });
      });

      describe('When: 設定オブジェクト変更検出', () => {
        it('Then: should detect and handle configuration object mutations - エッジケース', () => {
          const manager = AgLoggerManager.createManager();
          const logger = manager.getLogger();

          // Test configuration object mutations
          const config: AgLoggerOptions = { logLevel: AG_LOGLEVEL.WARN };
          manager.setLoggerConfig(config);
          expect(logger.logLevel).toBe(AG_LOGLEVEL.WARN);

          // Mutate original config object (should not affect logger)
          config.logLevel = AG_LOGLEVEL.ERROR;
          expect(logger.logLevel).toBe(AG_LOGLEVEL.WARN); // Should remain unchanged
        });

        it('Then: should handle null/undefined config mutations - エッジケース', () => {
          const manager = AgLoggerManager.createManager();
          const logger = manager.getLogger();

          // Set initial config
          const config: AgLoggerOptions = { logLevel: AG_LOGLEVEL.INFO };
          manager.setLoggerConfig(config);
          expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);

          // Attempt to corrupt the config reference
          (config as unknown as { logLevel: null; formatter: undefined }).logLevel = null;
          (config as unknown as { logLevel: null; formatter: undefined }).formatter = undefined;

          // Logger should maintain its state
          expect(logger.logLevel).toBe(AG_LOGLEVEL.INFO);
          expect(() => logger.info('test after config corruption')).not.toThrow();
        });

        it('Then: should handle config reference replacement - エッジケース', () => {
          const manager = AgLoggerManager.createManager();

          // Set initial config
          const config1: AgLoggerOptions = { logLevel: AG_LOGLEVEL.DEBUG };
          manager.setLoggerConfig(config1);
          expect(manager.getLogger().logLevel).toBe(AG_LOGLEVEL.DEBUG);

          // Replace with new config object
          const config2: AgLoggerOptions = { logLevel: AG_LOGLEVEL.ERROR };
          manager.setLoggerConfig(config2);
          expect(manager.getLogger().logLevel).toBe(AG_LOGLEVEL.ERROR);

          // Original config mutations should not affect current state
          config1.logLevel = AG_LOGLEVEL.TRACE;
          expect(manager.getLogger().logLevel).toBe(AG_LOGLEVEL.ERROR);
        });
      });

      describe('When: Manager-Logger参照不一致', () => {
        it('Then: should maintain consistent references after multiple operations - エッジケース', () => {
          const manager = AgLoggerManager.createManager();
          const logger1 = manager.getLogger();

          // Perform multiple config changes
          manager.setLoggerConfig({ logLevel: AG_LOGLEVEL.WARN });
          const logger2 = manager.getLogger();

          manager.setLoggerConfig({ logLevel: AG_LOGLEVEL.ERROR });
          const logger3 = manager.getLogger();

          // All logger references should be the same instance
          expect(logger1).toBe(logger2);
          expect(logger2).toBe(logger3);
          expect(logger1.logLevel).toBe(AG_LOGLEVEL.ERROR);
        });

        it('Then: should handle concurrent access patterns - エッジケース', () => {
          const manager = AgLoggerManager.createManager();

          // Simulate concurrent access to logger and config changes
          const loggers = Array.from({ length: 5 }, () => manager.getLogger());

          // All should be the same reference
          loggers.forEach((logger, index) => {
            expect(logger).toBe(loggers[0]);
            expect(() => logger.info(`concurrent test ${index}`)).not.toThrow();
          });

          // Config change during concurrent access
          manager.setLoggerConfig({ logLevel: AG_LOGLEVEL.FATAL });

          // All logger references should still work with new config
          loggers.forEach((logger, index) => {
            expect(logger.logLevel).toBe(AG_LOGLEVEL.FATAL);
            expect(() => logger.fatal(`post-config test ${index}`)).not.toThrow();
          });
        });
      });
    });
  });
});
