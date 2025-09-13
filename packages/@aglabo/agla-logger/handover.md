# テストスイート3階層BDD構造再構成 - 引き継ぎ資料

## 📋 作業概要

**目的**: 現在のテストスイートを3階層BDD構造（Given/Feature-When-Then）に統一し、複数TOPレベルdescribeを許容する構造に再構成する。

**作業範囲**: 全53テストファイル（Unit:27, Functional:4, Integration:14, E2E:8）

**期限**: Phase 1（4階層問題修正）を最優先、Phase 2-3は段階的実施

## 🎯 目標構造仕様

### 2階層BDD構造定義（Given/When/Then または Feature/When/Then のみ）

```typescript
// パターンA: Given開始（既存の優良例）
describe('Given: [前提条件]', () => {
  describe('When: [具体的操作]', () => {
    it('Then: [正常|異常|エッジ] - should [期待動作]', () => {
      // テスト実装
    });
  });
});

// パターンB: Feature開始（機能単位テスト）
describe('Feature: [機能名]', () => {
  describe('When: [具体的操作]', () => {
    it('Then: [正常|異常|エッジ] - should [期待動作]', () => {
      // テスト実装
    });
  });
});
```

**重要**: TOPレベルのクラス名のみのdescribe（例：`describe('AgLogger', () => {}`）は削除し、Given/Featureを直接TOPレベルに配置する。

### テストタイプ分類タグ（必須）

- **[正常]**: 期待された入力での正常動作
- **[異常]**: エラー入力での適切なエラー処理
- **[エッジ]**: 境界値・特殊条件での動作

### it文統一フォーマット

```typescript
it('Then: [正常|異常|エッジ] - should [期待動作]', () => {});
```

## 🚨 現状問題点と対象ファイル

### Phase 1: 4階層問題修正（最優先）

#### 1. `src/plugins/formatter/__tests__/MockFormatter.errorThrow.spec.ts`

**問題**: 現在3階層だが、4階層潜在リスク
**現在構造**:

```typescript
describe('MockFormatter.errorThrow - Comprehensive Tests', () => {
  describe('Given: MockFormatter.errorThrow instance', () => {
    describe('When: performing basic operations', () => {
      it('Then: should throw default mock error', () => {});
    });
  });
});
```

**修正方針**: 現在の構造は良好。テストタイプタグ付けのみ実施
**修正例**:

```typescript
it('Then: [異常] - should throw default mock error', () => {});
it('Then: [異常] - should throw custom default error', () => {});
```

#### 2. 他の4階層問題ファイル特定

**調査コマンド**:

```bash
# MCPツールで4階層以上検索
mcp__serena-mcp__search_for_pattern --substring_pattern "describe.*describe.*describe.*describe" --paths_include_glob "*.spec.ts"
```

### Phase 2: Given/Feature統合パターン適用

#### Given開始パターン（優良実装維持）

**対象ファイル例**: `src/__tests__/functional/AgLogger.functional.spec.ts`
**現在構造**: ✅ 既に3階層Given-When-Then実装済み
**作業**: テストタイプタグ付けのみ

#### Feature開始パターン（新規採用検討）

**適用候補**: 機能単位テスト（E2Eテストなど）
**例**: `tests/e2e/console-output/application-lifecycle.e2e.spec.ts`

### 修正後の構造例（TOPレベルのクラス名削除）

#### Before（削除対象）

```typescript
describe('AgLogger', () => { // ← このTOPレベルクラス名は削除
  describe('Given: logger instance exists', () => {
    describe('When: calling log methods', () => {
      it('should output formatted messages', () => {});
    });
  });
});
```

#### After（Given/Feature直接TOP）

```typescript
// 複数のGiven/Featureを直接TOPレベルに配置
describe('Given: logger instance exists', () => {
  describe('When: calling log methods', () => {
    it('Then: [正常] - should output formatted messages', () => {});
  });
});

describe('Given: invalid configuration', () => {
  describe('When: initializing logger', () => {
    it('Then: [異常] - should throw AgLoggerError', () => {});
  });
});

describe('Feature: high load scenario handling', () => {
  describe('When: logging 1000 messages', () => {
    it('Then: [エッジ] - should complete within time limit', () => {});
  });
});
```

## 📂 ファイル別作業計画

### Unit Tests（src/**tests**/）- 27ファイル

#### 優先度A: 即座修正必要

- `AgTypes.spec.ts`: テストタイプタグ付け
- `agManagerUtils/core.spec.ts`: 3階層化確認
- `agManagerUtils/methodReplacement.spec.ts`: 3階層化確認

#### 優先度B: 段階的修正

- `units/plugins/formatter/*.spec.ts`: 8ファイル
- `plugins/formatter/__tests__/*.spec.ts`: 4ファイル
- `plugins/logger/__tests__/*.spec.ts`: 9ファイル

### Functional Tests（src/**tests**/functional/）- 4ファイル

#### 優良実装維持

- `AgLogger.functional.spec.ts` ✅: テストタイプタグ付けのみ
- `AgLoggerManager.functional.spec.ts` ✅: テストタイプタグ付けのみ

#### 要確認・修正

- `features/plainOutput.functional.spec.ts`: 構造確認後修正
- `internal/AgLoggerConfig.functional.spec.ts`: 構造確認後修正

### Integration Tests（tests/integration/）- 14ファイル

#### 優良実装維持

- `mock-output/manager/singleton-management.integration.spec.ts` ✅: テストタイプタグ付けのみ

#### Feature開始パターン適用候補

- `console-output/combinations/*.integration.spec.ts`
- `mock-output/plugins/combinations/*.integration.spec.ts`

### E2E Tests（tests/e2e/）- 8ファイル

#### Feature開始パターン適用推奨

全8ファイルでFeature-When-Then構造採用検討

- `console-output/*.e2e.spec.ts`: 4ファイル
- `mock-output/*.e2e.spec.ts`: 4ファイル

## 🛠️ 実装手順書

### Step 1: 現状調査・問題ファイル特定

```bash
# 4階層問題検索
mcp__serena-mcp__search_for_pattern --substring_pattern "describe.*describe.*describe.*describe" --paths_include_glob "*.spec.ts"

# Given/When/Then使用状況調査
mcp__serena-mcp__search_for_pattern --substring_pattern "Given:|When:|Then:" --paths_include_glob "*.spec.ts"

# テストファイル詳細調査
mcp__serena-mcp__get_symbols_overview --relative_path "[対象ファイル]"
```

### Step 2: ファイル別修正実装

#### 標準修正パターンA: テストタイプタグ付けのみ

```typescript
// Before
it('should create new AgLogger instance', () => {});

// After
it('Then: [正常] - should create new AgLogger instance', () => {});
```

#### 標準修正パターンB: TOPレベルクラス名削除 + 2階層BDD化

```typescript
// Before（TOPレベルクラス名 + 複雑階層）
describe('MockFormatter', () => { // ← 削除対象
  describe('正常系テスト（Normal Cases）', () => {
    describe('基本動作の確認', () => {
      it('should throw error', () => {});
    });
  });
});

// After（Given/Feature直接TOP + 2階層BDD）
describe('Given: MockFormatter with error throwing behavior', () => {
  describe('When: executing format operation', () => {
    it('Then: [異常] - should throw default error', () => {});
  });
});
```

#### 標準修正パターンC: Feature開始パターン（E2E/Integration向け）

```typescript
// Before（クラス名TOP + 複雑構造）
describe('ApplicationLifecycleTest', () => { // ← 削除対象
  describe('初期化処理', () => {
    describe('正常ケース', () => {
      it('should setup logger configuration', () => {});
    });
  });
});

// After（Feature直接TOP + 2階層BDD）
describe('Feature: Application Lifecycle Management', () => {
  describe('When: initializing application', () => {
    it('Then: [正常] - should setup logger configuration', () => {});
    it('Then: [異常] - should handle initialization errors', () => {});
  });
});
```

### Step 3: 検証・品質確保

#### テスト実行確認

```bash
# 全テスト実行（修正後の動作確認）
pnpm run test:all

# 型チェック（TypeScript整合性確認）
pnpm run check:types

# リント確認（コードスタイル確認）
pnpm run lint:all
```

#### カバレッジ維持確認

- 修正前後でテストカバレッジ維持確認
- テスト実行時間大幅増加がないか確認

## 📋 品質チェックリスト

### 修正完了確認項目

#### ✅ 構造確認

- [ ] 全ファイルで3階層厳守
- [ ] Given/Feature-When-Then構造遵守
- [ ] 複数TOPレベルdescribe適切実装
- [ ] 4階層問題解消

#### ✅ タグ付け確認

- [ ] 全it文でテストタイプタグ付け実施
- [ ] 正常系・異常系・エッジケース分類適切
- [ ] Then: [期待動作] - [テストタイプ]形式遵守

#### ✅ 動作確認

- [ ] 全テスト実行成功
- [ ] 型チェック問題なし
- [ ] リント問題なし
- [ ] カバレッジ維持

#### ✅ ドキュメント更新

- [ ] test_structure_patterns_2025メモリ更新
- [ ] 変更内容詳細記録
- [ ] 新規パターン例追加

## 🔍 参考情報・関連ファイル

### 優良実装参考ファイル

1. **`src/__tests__/functional/AgLogger.functional.spec.ts`**: Given-When-Then模範実装
2. **`tests/integration/mock-output/manager/singleton-management.integration.spec.ts`**: 統合テストBDD実装例

### 重要設定ファイル

- **`vitest.config.ts`**: テスト実行設定
- **`CLAUDE.md`**: プロジェクト開発ガイド
- **`docs/claude/03-development-workflow.md`**: BDD開発プロセス詳細

### MCPツール活用

- **serena-mcp**: コード構造分析・パターン検索
- **lsmcp**: シンボル詳細調査・LSP機能活用

## 📊 進捗管理

### Phase 1（最優先）

- [ ] 4階層問題ファイル特定完了
- [ ] MockFormatter.errorThrow.spec.ts修正完了
- [ ] 他の4階層問題ファイル修正完了

### Phase 2（中優先）

- [ ] Unit Tests（27ファイル）修正完了
- [ ] Functional Tests（4ファイル）修正完了
- [ ] Integration Tests（14ファイル）修正完了
- [ ] E2E Tests（8ファイル）修正完了

### Phase 3（低優先）

- [ ] BDD構造Lintルール導入検討
- [ ] テストパフォーマンス最適化
- [ ] ドキュメント・メモリ最終更新

---

## 💡 重要な注意事項

### シングルトン状態管理

- AgLogger, AgLoggerManagerのシングルトンリセット必須
- beforeEach/afterEachでの適切な状態分離

### テスト実行戦略

- Sequential実行継続（シングルトン競合回避）
- モック状態の適切な分離・リセット

### BDD原則遵守

- Given（前提条件）、When（操作・イベント）、Then（期待結果）の明確な分離
- 自然言語による仕様記述の徹底
- テストタイプ分類による品質保証強化

**この引き継ぎ資料により、Claude CodeやCodexがテストスイートを3階層BDD構造に段階的・確実に再構成できます。**
