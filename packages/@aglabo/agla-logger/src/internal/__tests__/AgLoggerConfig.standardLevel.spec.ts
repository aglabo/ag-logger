// src/internal/__tests__/AgLoggerConfig.standardLevel.spec.ts
// @(#) : AgLoggerConfig special log level handling BDD test implementation
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AG_LOGLEVEL } from '../../../shared/types';
import type { AgLogLevel } from '../../../shared/types';
import { AgLoggerConfig } from '../AgLoggerConfig.class';

describe('AgLoggerConfig special log level handling', () => {
  let config: AgLoggerConfig;

  beforeEach(() => {
    config = new AgLoggerConfig();
  });

  afterEach(() => {
    // Clean up any side effects
  });

  describe('Given: AgLoggerConfig with initial level configuration', () => {
    describe('When: attempting to set special levels', () => {
      it('Then: should ignore VERBOSE（-11）setting and preserve original level - 異常系', () => {
        // Given: 初期状態でOFF（0）に設定
        const initialLevel = AG_LOGLEVEL.OFF;
        config.logLevel = initialLevel;
        expect(config.logLevel).toBe(initialLevel);

        // When: 特殊レベルVERBOSEを設定
        config.logLevel = AG_LOGLEVEL.VERBOSE;

        // Then: 設定が無視され、元のレベルが保持される
        expect(config.logLevel).toBe(initialLevel);
      });

      it('Then: should ignore LOG（-12）setting and preserve original level - 異常系', () => {
        // Given: 初期状態でINFO（4）に設定
        const initialLevel = AG_LOGLEVEL.INFO;
        config.logLevel = initialLevel;
        expect(config.logLevel).toBe(initialLevel);

        // When: 特殊レベルLOGを設定
        config.logLevel = AG_LOGLEVEL.LOG;

        // Then: 設定が無視され、元のレベルが保持される
        expect(config.logLevel).toBe(initialLevel);
      });

      it('Then: should ignore DEFAULT（-99）setting and preserve original level - 異常系', () => {
        // Given: 初期状態でDEBUG（5）に設定
        const initialLevel = AG_LOGLEVEL.DEBUG;
        config.logLevel = initialLevel;
        expect(config.logLevel).toBe(initialLevel);

        // When: 特殊レベルDEFAULTを設定
        config.logLevel = AG_LOGLEVEL.DEFAULT;

        // Then: 設定が無視され、元のレベルが保持される
        expect(config.logLevel).toBe(initialLevel);
      });
    });
  });

  describe('Given: AgLoggerConfig in initial state', () => {
    describe('When: setting standard log levels', () => {
      it('Then: should accept OFF（0）level setting - 正常系', () => {
        // Given: 初期状態
        // When: 通常レベルを設定
        config.logLevel = AG_LOGLEVEL.OFF;

        // Then: 設定が反映される
        expect(config.logLevel).toBe(AG_LOGLEVEL.OFF);
      });

      it('Then: should accept FATAL（1）level setting - 正常系', () => {
        // Given: 初期状態
        // When: 通常レベルを設定
        config.logLevel = AG_LOGLEVEL.FATAL;

        // Then: 設定が反映される
        expect(config.logLevel).toBe(AG_LOGLEVEL.FATAL);
      });

      it('Then: should accept ERROR（2）level setting - 正常系', () => {
        // Given: 初期状態
        // When: 通常レベルを設定
        config.logLevel = AG_LOGLEVEL.ERROR;

        // Then: 設定が反映される
        expect(config.logLevel).toBe(AG_LOGLEVEL.ERROR);
      });

      it('Then: should accept WARN（3）level setting - 正常系', () => {
        // Given: 初期状態
        // When: 通常レベルを設定
        config.logLevel = AG_LOGLEVEL.WARN;

        // Then: 設定が反映される
        expect(config.logLevel).toBe(AG_LOGLEVEL.WARN);
      });

      it('Then: should accept INFO（4）level setting - 正常系', () => {
        // Given: 初期状態
        // When: 通常レベルを設定
        config.logLevel = AG_LOGLEVEL.INFO;

        // Then: 設定が反映される
        expect(config.logLevel).toBe(AG_LOGLEVEL.INFO);
      });

      it('Then: should accept DEBUG（5）level setting - 正常系', () => {
        // Given: 初期状態
        // When: 通常レベルを設定
        config.logLevel = AG_LOGLEVEL.DEBUG;

        // Then: 設定が反映される
        expect(config.logLevel).toBe(AG_LOGLEVEL.DEBUG);
      });

      it('Then: should accept TRACE（6）level setting - 正常系', () => {
        // Given: 初期状態
        // When: 通常レベルを設定
        config.logLevel = AG_LOGLEVEL.TRACE;

        // Then: 設定が反映される
        expect(config.logLevel).toBe(AG_LOGLEVEL.TRACE);
      });
    });
  });

  describe('Given: AgLoggerConfig with WARN level set', () => {
    describe('When: attempting multiple special level settings sequentially', () => {
      it('Then: should ignore all special level attempts and preserve original level - エッジケース', () => {
        // Given: 初期状態でWARN（3）に設定
        const initialLevel = AG_LOGLEVEL.WARN;
        config.logLevel = initialLevel;
        expect(config.logLevel).toBe(initialLevel);

        // When: 複数の特殊レベルを順番に設定
        config.logLevel = AG_LOGLEVEL.VERBOSE;
        expect(config.logLevel).toBe(initialLevel);

        config.logLevel = AG_LOGLEVEL.LOG;
        expect(config.logLevel).toBe(initialLevel);

        config.logLevel = AG_LOGLEVEL.DEFAULT;

        // Then: 最後まですべて無視され、元のレベルが保持される
        expect(config.logLevel).toBe(initialLevel);
      });
    });
  });

  describe('Given: AgLoggerConfig with ERROR level set', () => {
    describe('When: attempting special level setting followed by standard level', () => {
      it('Then: should ignore special level but accept subsequent standard level - エッジケース', () => {
        // Given: 初期状態でERROR（2）に設定
        const initialLevel = AG_LOGLEVEL.ERROR;
        config.logLevel = initialLevel;
        expect(config.logLevel).toBe(initialLevel);

        // When: 特殊レベルを設定（無視される）
        config.logLevel = AG_LOGLEVEL.VERBOSE;
        expect(config.logLevel).toBe(initialLevel);

        // Then: その後の通常レベル設定は正常に動作する
        const newLevel = AG_LOGLEVEL.DEBUG;
        config.logLevel = newLevel;
        expect(config.logLevel).toBe(newLevel);
      });
    });
  });

  describe('Given: AgLoggerConfig with standard levels', () => {
    describe('When: attempting to set out-of-range values', () => {
      it('Then: should ignore negative out-of-range value (-1) - エッジケース', () => {
        // Given: 初期状態でINFO（4）に設定
        const initialLevel = AG_LOGLEVEL.INFO;
        config.logLevel = initialLevel;

        // When: 範囲外の値を設定
        config.logLevel = -1 as AgLogLevel;

        // Then: 設定が無視される
        expect(config.logLevel).toBe(initialLevel);
      });

      it('Then: should ignore positive out-of-range value (7) - エッジケース', () => {
        // Given: 初期状態でTRACE（6）に設定
        const initialLevel = AG_LOGLEVEL.TRACE;
        config.logLevel = initialLevel;

        // When: 範囲外の値を設定
        config.logLevel = 7 as AgLogLevel;

        // Then: 設定が無視される
        expect(config.logLevel).toBe(initialLevel);
      });

      it('Then: should handle extreme out-of-range values appropriately - エッジケース', () => {
        // Given: 初期状態でDEBUG（5）に設定
        const initialLevel = AG_LOGLEVEL.DEBUG;
        config.logLevel = initialLevel;

        // When: 極端な範囲外の値を設定
        config.logLevel = -1000 as AgLogLevel;
        expect(config.logLevel).toBe(initialLevel);

        config.logLevel = 1000 as AgLogLevel;
        expect(config.logLevel).toBe(initialLevel);

        config.logLevel = Number.MAX_SAFE_INTEGER as AgLogLevel;

        // Then: すべて無視され、元のレベルが保持される
        expect(config.logLevel).toBe(initialLevel);
      });

      it('Then: should handle undefined and null level assignments - エッジケース', () => {
        // Given: 初期状態でINFO（4）に設定
        const initialLevel = AG_LOGLEVEL.INFO;
        config.logLevel = initialLevel;

        // When: undefined/null値を設定
        config.logLevel = undefined as unknown as AgLogLevel;
        expect(config.logLevel).toBe(initialLevel);

        config.logLevel = null as unknown as AgLogLevel;

        // Then: すべて無視され、元のレベルが保持される
        expect(config.logLevel).toBe(initialLevel);
      });

      it('Then: should handle non-numeric type coercion attempts - エッジケース', () => {
        // Given: 初期状態でWARN（3）に設定
        const initialLevel = AG_LOGLEVEL.WARN;
        config.logLevel = initialLevel;

        // When: 文字列や他の型を設定
        config.logLevel = 'FATAL' as unknown as AgLogLevel;
        expect(config.logLevel).toBe(initialLevel);

        config.logLevel = true as unknown as AgLogLevel;
        expect(config.logLevel).toBe(initialLevel);

        config.logLevel = {} as unknown as AgLogLevel;

        // Then: すべて無視され、元のレベルが保持される
        expect(config.logLevel).toBe(initialLevel);
      });
    });
  });

  describe('Given: AgLoggerConfig with log level mapping consistency requirements', () => {
    describe('When: checking internal level mapping consistency', () => {
      it('Then: should maintain consistent level hierarchy ordering - エッジケース', () => {
        // Given: 各レベルを順番に設定（OFFを除外：特殊な動作のため）
        const levels = [
          AG_LOGLEVEL.FATAL,
          AG_LOGLEVEL.ERROR,
          AG_LOGLEVEL.WARN,
          AG_LOGLEVEL.INFO,
          AG_LOGLEVEL.DEBUG,
          AG_LOGLEVEL.TRACE,
        ];

        // When: 各レベルのshouldOutput動作を確認
        levels.forEach((level, index) => {
          config.logLevel = level;
          expect(config.logLevel).toBe(level);

          // Then: より高いレベルのメッセージは出力される（数値が小さい = 高いレベル）
          for (let i = 0; i <= index; i++) {
            expect(config.shouldOutput(levels[i]), `Level ${levels[i]} should be output when config is set to ${level}`)
              .toBe(true);
          }

          // Then: より低いレベルのメッセージは出力されない（数値が大きい = 低いレベル）
          for (let i = index + 1; i < levels.length; i++) {
            expect(
              config.shouldOutput(levels[i]),
              `Level ${levels[i]} should not be output when config is set to ${level}`,
            ).toBe(false);
          }
        });

        // Then: OFFレベルの特殊動作を個別テスト
        config.logLevel = AG_LOGLEVEL.OFF;
        expect(config.logLevel).toBe(AG_LOGLEVEL.OFF);

        // OFF設定時は全レベルでfalse（特殊動作）
        levels.forEach((level) => {
          expect(config.shouldOutput(level), `Level ${level} should not be output when config is set to OFF`).toBe(
            false,
          );
        });
      });

      it('Then: should handle rapid level changes without inconsistency - エッジケース', () => {
        // Given: 初期状態
        const testLevels = [AG_LOGLEVEL.TRACE, AG_LOGLEVEL.OFF, AG_LOGLEVEL.ERROR, AG_LOGLEVEL.DEBUG];

        // When: 高速でレベルを変更
        testLevels.forEach((level) => {
          config.logLevel = level;

          // Then: 設定が即座に反映される
          expect(config.logLevel).toBe(level);

          // Then: shouldOutput動作が一貫している
          expect(config.shouldOutput(AG_LOGLEVEL.FATAL)).toBe(level >= AG_LOGLEVEL.FATAL);
          expect(config.shouldOutput(AG_LOGLEVEL.ERROR)).toBe(level >= AG_LOGLEVEL.ERROR);
          expect(config.shouldOutput(AG_LOGLEVEL.WARN)).toBe(level >= AG_LOGLEVEL.WARN);
          expect(config.shouldOutput(AG_LOGLEVEL.INFO)).toBe(level >= AG_LOGLEVEL.INFO);
          expect(config.shouldOutput(AG_LOGLEVEL.DEBUG)).toBe(level >= AG_LOGLEVEL.DEBUG);
          expect(config.shouldOutput(AG_LOGLEVEL.TRACE)).toBe(level >= AG_LOGLEVEL.TRACE);
        });
      });

      it('Then: should handle level boundary conditions correctly - エッジケース', () => {
        // Given: 境界値のテスト
        config.logLevel = AG_LOGLEVEL.WARN;

        // When: 境界レベルでのshouldOutput確認
        // Then: WARN以上は出力される
        expect(config.shouldOutput(AG_LOGLEVEL.OFF)).toBe(true);
        expect(config.shouldOutput(AG_LOGLEVEL.FATAL)).toBe(true);
        expect(config.shouldOutput(AG_LOGLEVEL.ERROR)).toBe(true);
        expect(config.shouldOutput(AG_LOGLEVEL.WARN)).toBe(true);

        // Then: WARN未満は出力されない
        expect(config.shouldOutput(AG_LOGLEVEL.INFO)).toBe(false);
        expect(config.shouldOutput(AG_LOGLEVEL.DEBUG)).toBe(false);
        expect(config.shouldOutput(AG_LOGLEVEL.TRACE)).toBe(false);

        // When: 特殊レベルでのshouldOutput動作確認
        // Then: 特殊レベルの動作確認
        expect(config.shouldOutput(AG_LOGLEVEL.VERBOSE)).toBe(false); // isVerboseがfalseのため
        expect(config.shouldOutput(AG_LOGLEVEL.LOG)).toBe(true); // LOGは常にtrue
        expect(config.shouldOutput(AG_LOGLEVEL.DEFAULT)).toBe(false); // DEFAULTはINFO相当、WARN設定ではfalse（INFO > WARN）
      });
    });
  });
});
