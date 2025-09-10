// tests/integration/mock-output/plugins/combinations/mock-plugin-combinations.integration.spec.ts
// @(#) : Mock Plugin Combinations Integration Tests - Mock logger and formatter combinations
//
// Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// テストフレームワーク: テスト実行・アサーション・モック
import { describe, expect, it, vi } from 'vitest';
import type { TestContext } from 'vitest';

// 共有定数: ログレベル定義
import { AG_LOGLEVEL } from '@shared/types';
import type { AgLoggerOptions, AgLogMessage } from '@shared/types';

// テスト対象: AgLoggerとエントリーポイント
import { AgLogger } from '@/AgLogger.class';

// プラグイン（フォーマッター）: 出力フォーマット実装
import { PlainFormatter } from '@/plugins/formatter/PlainFormatter';

// プラグイン（ロガー）: モック実装
import { MockFormatter } from '@/plugins/formatter/MockFormatter';
import { MockLogger } from '@/plugins/logger/MockLogger';
import type { AgMockBufferLogger } from '@/plugins/logger/MockLogger';
import type { AgMockConstructor } from '@shared/types/AgMockConstructor.class';

/**
 * Mock Plugin Combinations Integration Tests
 *
 * @description Mock出力でのフォーマッターとロガーの組み合わせ統合動作を保証するテスト
 * atsushifx式BDD：Given-When-Then形式で自然言語記述による仕様定義
 */
describe('Mock Output Plugin Combination Integration', () => {
  const setupTestContext = (_ctx?: TestContext): {
    mockLogger: AgMockBufferLogger;
    mockFormatter: AgMockConstructor;
  } => {
    const _mockLogger = new MockLogger.buffer();
    const _mockFormatter = MockFormatter.passthrough;

    vi.clearAllMocks();
    AgLogger.resetSingleton();

    _ctx?.onTestFinished(() => {
      AgLogger.resetSingleton();
      vi.clearAllMocks();
    });

    return {
      mockLogger: _mockLogger,
      mockFormatter: _mockFormatter,
    };
  };

  /**
   * Given: 高負荷処理環境でプラグイン組み合わせが使用される場合
   * When: 大量のログメッセージを処理した時
   * Then: 組み合わせでも安定したパフォーマンスを維持する
   */
  describe('Given high-load plugin combinations', () => {
    describe('When combining multiple plugins under load', () => {
      // 目的: 高頻度ログ出力時の組み合わせ処理性能
      it('Then should maintain stability and performance across all plugins', () => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 高負荷対応の組み合わせ設定

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 高頻度ログ処理の実行
        const iterations = 1000;
        const startTime = Date.now();

        for (let i = 0; i < iterations; i++) {
          logger.debug(`Log message ${i}`, { iteration: i });
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Then: 組み合わせでも合理的な処理時間（1000回で1秒以内）
        expect(totalTime).toBeLessThan(1000);
        expect(mockLogger.getMessageCount()).toBe(iterations);
      });
    });

    describe('When applying filters with active plugin combinations', () => {
      // 目的: フィルタリングによる出力抑制時の組み合わせ低オーバーヘッド
      it('Then should coordinate filtering behavior across all components', () => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 厳格フィルタリング + 組み合わせ設定

        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.ERROR;

        // When: フィルタリングされるレベルで大量処理
        const iterations = 1000;
        const startTime = Date.now();

        for (let i = 0; i < iterations; i++) {
          logger.debug(`Debug message ${i}`, { large: 'data'.repeat(100) });
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Then: 組み合わせでもフィルタリングによる高速処理（100ms以内）
        expect(totalTime).toBeLessThan(100);
        expect(mockLogger.getMessageCount()).toBe(0);
      });
    });
  });

  /**
   * Given: 複雑データ処理でプラグイン組み合わせが使用される場合
   * When: 複雑データ構造を各組み合わせで処理した時
   * Then: データ整合性を保って適切に処理される
   */
  describe('Given complex data plugin combinations', () => {
    describe('When processing complex data through plugin combinations', () => {
      // 目的: 複雑オブジェクトを各プラグイン組合せで安定処理
      it('Then should handle data complexity across all plugin layers', () => {
        const { mockLogger } = setupTestContext();

        // Given: 複雑データ構造
        const complexData = {
          nested: {
            array: [1, 2, 3],
            object: { key: 'value' },
            null: null,
            undefined: undefined,
          },
          primitives: {
            string: 'test',
            number: 42,
            boolean: true,
          },
        };

        // When: JsonFormatter + MockLogger 組み合わせでテスト

        const jsonLogger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.json,
        });
        jsonLogger.logLevel = AG_LOGLEVEL.INFO;
        jsonLogger.info('Complex data', complexData);

        // Then: JSON組み合わせで適切に処理
        expect(mockLogger.getMessageCount()).toBe(1); // MockLoggerの呼び出し回数が1回になる
        const jsonOutput = mockLogger.getMessages()[0] as string;

        expect(() => JSON.parse(jsonOutput)).not.toThrow();
        const parsedJson = JSON.parse(jsonOutput);
        expect(parsedJson.args[0]).toEqual(complexData);

        // When: PlainFormatter + MockLogger 組み合わせでテスト
        mockLogger.reset();
        const plainLogger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: PlainFormatter,
        });
        plainLogger.logLevel = AG_LOGLEVEL.INFO;
        plainLogger.info('Complex data', complexData);

        // Then: Plain組み合わせで適切に処理
        expect(mockLogger.getMessageCount()).toBe(1);
        const plainOutput = mockLogger.getMessages()[0] as string;

        expect(plainOutput).toContain('Complex data');
        expect(plainOutput).toContain('{"nested"'); // JSON.stringify representation
      });
    });

    describe('When processing large data sets across combinations', () => {
      // 目的: 大規模データ引数での組み合わせ性能検証
      it('Then should handle large data sets efficiently across combinations', () => {
        const { mockLogger } = setupTestContext();

        // Given: 大規模データセット
        const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i, data: `item${i}` }));

        // When: 組み合わせでの大規模データ処理
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.json,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        const startTime = Date.now();
        logger.info('Large data set', largeArray);
        const endTime = Date.now();

        // Then: 組み合わせでも合理的な処理時間（100ms以内）
        expect(endTime - startTime).toBeLessThan(100);
        expect(mockLogger.getMessageCount()).toBe(1);

        const output = mockLogger.getMessages()[0] as string;
        expect(() => JSON.parse(output)).not.toThrow();
      });
    });
  });

  /**
   * Given: エラー復旧が必要な環境でプラグイン組み合わせが使用される場合
   * When: 組み合わせ内でエラーが発生した時
   * Then: 適切なエラー処理と復旧が行われる
   */
  describe('Given error recovery plugin combinations', () => {
    describe('When plugins encounter errors in combination', () => {
      // 目的: ロガー側エラー時でもフォーマッター呼出は実施
      it('Then should provide coordinated error recovery behavior', () => {
        setupTestContext();

        // Given: エラーロガー + 正常フォーマッター組み合わせ
        const logger = AgLogger.createLogger({
          defaultLogger: MockLogger.throwError('Logger error'),
          formatter: MockFormatter.returnValue('formatted message'),
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 組み合わせエラーでのログ出力
        expect(() => {
          logger.info('test message');
        }).toThrow('Logger error');

        // Then: フォーマッターは組み合わせ内で正常実行される
        const stats = logger.getStatsFormatter()?.getStats();
        expect(stats?.callCount).toBe(1);
        expect(stats?.lastMessage?.message).toBe('test message'); // format前のメッセージが返る
      });
    });

    describe('When plugins recover from errors', () => {
      // 目的: プラグインエラー発生後もシステム安定性を維持
      it('Then should maintain system stability after combination errors', () => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 初期エラー組み合わせ
        const logger = AgLogger.createLogger({
          defaultLogger: MockLogger.throwError('Temporary error'),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 初期組み合わせでエラー発生
        expect(() => {
          logger.info('first message');
        }).toThrow('Temporary error');

        // When: 正常な組み合わせに置換
        logger.setLoggerConfig({
          defaultLogger: mockLogger.getLoggerFunction(),
        });

        // Then: 組み合わせ回復後は正常動作
        expect(() => {
          logger.info('second message');
        }).not.toThrow();

        const lastMessage = mockLogger.getLastMessage() as AgLogMessage;
        expect(mockLogger.getMessageCount()).toBe(1);
        expect(lastMessage.message).toBe('second message');
      });
    });
  });

  /**
   * Given: プラグイン初期化エッジケースが存在する場合
   * When: プラグイン初期化時に予期しない状況が発生した時
   * Then: 適切なエラー処理と復旧が実行される
   */
  describe('Given plugin initialization edge cases', () => {
    describe('When plugins fail during initialization phase', () => {
      // 目的: フォーマッター実行時失敗の適切なエラーハンドリング
      it('Then should handle formatter execution failures gracefully - 異常系', () => {
        setupTestContext();

        // Given: 実行時失敗するフォーマッター + 正常ロガー組み合わせ
        const errorFormatter = (): never => {
          throw new Error('Formatter execution failed');
        };

        // When: 実行時失敗フォーマッターでLogger作成・使用
        const mockLoggerInstance = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: mockLoggerInstance.getLoggerFunction(),
          formatter: errorFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // Then: ログ実行時にフォーマッターエラーが発生
        expect(() => {
          logger.info('test message');
        }).toThrow('Formatter execution failed');

        // Then: システム状態は清浄に保たれる
        expect(AgLogger.getLogger()).toBeDefined(); // デフォルトロガーは利用可能
      });

      // 目的: ロガー初期化失敗時の適切なエラーハンドリング
      it('Then should handle logger initialization failures gracefully - 異常系', () => {
        const { mockFormatter } = setupTestContext();

        // Given: 初期化失敗するロガー + 正常フォーマッター組み合わせ
        const errorLogger = (): void => {
          throw new Error('Logger initialization failed');
        };

        // When: 初期化失敗ロガーでLogger作成
        const logger = AgLogger.createLogger({
          defaultLogger: errorLogger,
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // Then: フォーマッター初期化は成功してもログ出力時にエラー
        expect(() => {
          logger.info('test message');
        }).toThrow('Logger initialization failed');
      });

      // 目的: 複合実行時失敗パターンでの堅牢性
      it('Then should maintain system robustness with compound execution failures - エッジケース', () => {
        setupTestContext();

        // Given: 複数の実行時失敗が重複する環境
        const errorFormatter = (): never => {
          throw new Error('Formatter exec error');
        };
        const errorLogger = (): void => {
          throw new Error('Logger exec error');
        };

        // When: 複合実行時失敗でLogger作成・使用
        const logger = AgLogger.createLogger({
          defaultLogger: errorLogger,
          formatter: errorFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // Then: ログ実行時にフォーマッターエラーが先に発生
        expect(() => {
          logger.info('test message');
        }).toThrow('Formatter exec error');

        // Then: システム全体の安定性維持（新しいクリーンなインスタンスで確認）
        AgLogger.resetSingleton(); // シングルトン状態をリセット
        const fallbackLogger = AgLogger.createLogger();
        expect(fallbackLogger).toBeDefined();
        expect(() => {
          fallbackLogger.info('fallback test');
        }).not.toThrow();
      });
    });

    describe('When plugin configuration inconsistencies occur', () => {
      // 目的: 設定オブジェクト不整合検出と修正
      it('Then should detect and handle configuration inconsistencies - 正常系', () => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 基本設定でLogger作成
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 不整合な設定変更を試行
        expect(() => {
          logger.setLoggerConfig({
            defaultLogger: undefined as AgLoggerOptions['defaultLogger'], // 不正な設定
          });
        }).toThrow(); // 設定バリデーションでエラー

        // Then: 既存設定は保持される
        logger.info('test after invalid config');
        expect(mockLogger.getMessageCount()).toBe(1);
        expect(mockLogger.getLastMessage()).toBeDefined();
      });

      // 目的: ランタイム設定変更時の整合性維持
      it('Then should maintain consistency during runtime configuration changes - エッジケース', () => {
        const { mockLogger } = setupTestContext();
        const secondMockLogger = new MockLogger.buffer();

        // Given: 動的設定変更が可能なLogger
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: MockFormatter.passthrough,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: ランタイム設定変更（ロガー置換）
        logger.info('message 1');
        logger.setLoggerConfig({
          defaultLogger: secondMockLogger.getLoggerFunction(),
        });
        logger.info('message 2');

        // Then: 各設定期間でのメッセージが適切に分離される
        expect(mockLogger.getMessageCount()).toBe(1);
        expect(secondMockLogger.getMessageCount()).toBe(1);

        const firstMessage = mockLogger.getLastMessage() as AgLogMessage;
        const secondMessage = secondMockLogger.getLastMessage() as AgLogMessage;
        expect(firstMessage.message).toBe('message 1');
        expect(secondMessage.message).toBe('message 2');
      });

      // 目的: プラグイン依存関係エッジケース処理
      it('Then should handle plugin dependency resolution edge cases - エッジケース', () => {
        setupTestContext();

        // Given: 循環依存的な設定パターン
        const configMockLogger = new MockLogger.buffer();
        const selfReferencingConfig = {
          defaultLogger: configMockLogger.getLoggerFunction(),
          formatter: MockFormatter.json,
        };

        // When: 複雑な依存関係でLogger構成
        const logger = AgLogger.createLogger(selfReferencingConfig);
        logger.logLevel = AG_LOGLEVEL.INFO;

        // Then: 依存関係は適切に解決される
        expect(() => {
          logger.info('dependency test', { complex: { nested: { data: true } } });
        }).not.toThrow();

        // Then: 設定参照は正しく解決される（内部設定は非公開のため動作確認）
        expect(() => {
          logger.info('dependency test', { complex: { nested: { data: true } } });
        }).not.toThrow();
        expect(typeof logger.getLoggerFunction).toBe('function');
      });
    });

    describe('When plugin state management encounters edge cases', () => {
      // 目的: プラグイン状態リセット時の一貫性
      it('Then should maintain plugin state consistency during resets - 正常系', () => {
        const { mockLogger, mockFormatter } = setupTestContext();

        // Given: 状態を持つプラグイン組み合わせ
        const logger = AgLogger.createLogger({
          defaultLogger: mockLogger.getLoggerFunction(),
          formatter: mockFormatter,
        });
        logger.logLevel = AG_LOGLEVEL.INFO;

        // When: 複数回の状態変更とリセット
        logger.info('message 1');
        mockLogger.reset();
        logger.info('message 2');
        AgLogger.resetSingleton();

        // Then: 状態リセット後は初期状態に戻る
        expect(mockLogger.getMessageCount()).toBe(1); // reset後のメッセージのみ
        const resetMessage = mockLogger.getLastMessage() as AgLogMessage;
        expect(resetMessage.message).toBe('message 2');
      });

      // 目的: プラグイン置換時のメモリ管理
      it('Then should handle plugin replacement memory management - エッジケース', () => {
        setupTestContext();

        // Given: メモリ集約的なプラグイン構成
        const heavyDataLogger = new MockLogger.buffer();
        const logger = AgLogger.createLogger({
          defaultLogger: heavyDataLogger.getLoggerFunction(),
          formatter: MockFormatter.json,
        });
        logger.logLevel = AG_LOGLEVEL.DEBUG;

        // When: 大量データでプラグイン使用後、置換
        for (let i = 0; i < 100; i++) {
          logger.debug('Heavy data', { iteration: i, data: 'x'.repeat(1000) });
        }

        const newLogger = new MockLogger.buffer();
        logger.setLoggerConfig({
          defaultLogger: newLogger.getLoggerFunction(),
        });

        // Then: 置換後は新しいプラグインが使用される
        logger.info('after replacement');
        expect(heavyDataLogger.getMessageCount()).toBe(100);
        expect(newLogger.getMessageCount()).toBe(1);

        // デバッグ: メッセージの取得方法を確認
        const messages = newLogger.getMessages();
        expect(messages).toHaveLength(1);

        // 適切な方法でメッセージを取得
        if (messages[0] && typeof messages[0] === 'object' && 'message' in messages[0]) {
          expect(messages[0].message).toBe('after replacement');
        } else {
          // メッセージが文字列形式の場合
          expect(messages[0]).toContain('after replacement');
        }
      });
    });
  });
});
