# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## @aglabo/ag-logger パッケージガイド

このファイルは、Claude Code (claude.ai/code) が@aglabo/ag-loggerパッケージでの作業時に参照するガイドです。

## 📋 完全ドキュメント参照

**詳細な情報は親プロジェクトの体系化されたドキュメントを参照してください：**

### 🔴 必須: 開発開始前確認

- **[../../docs/claude/12-mcp-tools-mandatory.md](../../docs/claude/12-mcp-tools-mandatory.md)** - **MCPツール必須使用要件**
- **[../../docs/claude/03-development-workflow.md](../../docs/claude/03-development-workflow.md)** - BDD開発フロー・実装手順

### 📚 主要リファレンス

- **[../../docs/claude/01-project-overview.md](../../docs/claude/01-project-overview.md)** - プロジェクト全体概要
- **[../../docs/claude/02-architecture-complete.md](../../docs/claude/02-architecture-complete.md)** - 技術アーキテクチャ詳細
- **[../../docs/claude/08-plugin-system-guide.md](../../docs/claude/08-plugin-system-guide.md)** - プラグインシステム詳細
- **[../../docs/claude/05-command-reference.md](../../docs/claude/05-command-reference.md)** - 開発コマンド完全リファレンス

## ⚡ @aglabo/ag-logger クイックリファレンス

### 基本情報

- **パッケージ**: TypeScript用構造化ロガー（プラガブルフォーマッター・ログバックエンド対応）
- **アーキテクチャ**: Strategy Pattern + Singleton Pattern
- **ビルド**: デュアルESM/CommonJS対応
- **テスト**: 4層テストアーキテクチャ

### 必須開発コマンド

```bash
# MCPツール必須使用（詳細は 12-mcp-tools-mandatory.md 参照）
# - すべての開発段階でlsmcp・serena-mcp使用必須

# 基本開発フロー
pnpm run check:types        # 型チェック（最優先）
pnpm run test:develop       # 単体テスト
pnpm run lint:all          # コード品質チェック
pnpm run build             # デュアルビルド（ESM+CJS+Types）

# 4層テストシステム
pnpm run test:unit         # 単体テスト（vitest unit config）
pnpm run test:functional   # 機能テスト（vitest functional config）
pnpm run test:integration  # 統合テスト（vitest integration config）
pnpm run test:e2e         # E2Eテスト（vitest e2e config）

# 包括テスト
pnpm run test:all          # 全テスト層実行

# 開発支援コマンド
pnpm run clean             # ビルド成果物削除
pnpm run sync:configs      # 設定ファイル同期
```

### 🏗️ コアアーキテクチャ概要

#### Strategy Pattern設計（3コアクラス連携）

```
AgLoggerManager (Singleton)
    ↓ manages
AgLogger (Singleton)
    ↓ uses
AgLoggerConfig
    ↓ coordinates
[Formatter Plugins] ↔ [Logger Plugins]
```

#### プラグインシステム

**Formatter Plugins**:

- `JsonFormatter`, `PlainFormatter`, `NullFormatter`, `MockFormatter`, `AgMockFormatter`

**Logger Plugins**:

- `ConsoleLogger`, `NullLogger`, `MockLogger`, `E2eMockLogger`

### 📂 ディレクトリ構造

```
src/
├── AgLogger.class.ts           # コアシングルトンロガー（24メソッド）
├── AgLoggerManager.class.ts    # システム管理ファサード（9メソッド）
├── AgManagerUtils.ts           # マネージャーユーティリティ・セットアップ
├── internal/                   # 内部実装
│   └── AgLoggerConfig.class.ts # 設定管理（19メソッド）
├── plugins/                    # Strategy Pattern実装
│   ├── formatter/              # メッセージフォーマット戦略（5プラグイン）
│   └── logger/                # 出力先戦略（4プラグイン）
├── utils/                      # 共有ユーティリティ
└── functional/                # 関数プログラミングユーティリティ

# ビルド出力（編集禁止）
├── lib/                       # CommonJS出力
├── module/                    # ESM出力
└── maps/                      # TypeScript宣言ファイル

# 4層テスト構造
src/__tests__/                 # 単体テスト
tests/functional/              # 機能テスト
tests/integration/             # 統合テスト
tests/e2e/                     # E2Eテスト
```

### 🔧 重要実装詳細

#### シングルトン管理

- `AgLogger`, `AgLoggerManager`でシングルトンパターン使用
- テスト間での`resetSingleton()`による状態リセット必須

#### ログレベル階層

```typescript
TRACE (0) → DEBUG (1) → VERBOSE (2) → INFO (3) → WARN (4) → ERROR (5) → FATAL (6)
```

#### プラグイン登録パターン

```typescript
// Formatters: AgFormatFunction = (logMessage: AgLogMessage) => string
// Loggers: AgLoggerFunction = (formattedMessage: string) => void
```

#### データフロー

```
User Code → logger.info() → executeLog()
    ↓
AgLoggerConfig.shouldOutput() [レベルフィルタリング]
    ↓
AgLoggerConfig.formatter() [メッセージフォーマット]
    ↓
AgLoggerConfig.defaultLogger() [メッセージ出力]
```

### 📋 開発ルール・制限事項

#### ファイル編集制限

- ❌ **編集禁止**: `lib/`, `module/`, `maps/`, `.cache/`
- ✅ **編集対象**: `src/`, `configs/`, `__tests__/`, `tests/`

#### 必須プラクティス

- **MCPツール**: すべての開発段階で必須使用
- **BDDサイクル**: Red-Green-Refactor厳格遵守
- **型安全性**: TypeScript strict mode必須
- **テスト**: シーケンシャル実行（シングルトン状態管理）

### 🔍 詳細情報アクセス

**パッケージ固有の詳細な情報については、以下を参照：**

- **全体理解** → [../../docs/claude/01-project-overview.md](../../docs/claude/01-project-overview.md)
- **アーキテクチャ詳細** → [../../docs/claude/02-architecture-complete.md](../../docs/claude/02-architecture-complete.md)
- **プラグインシステム** → [../../docs/claude/08-plugin-system-guide.md](../../docs/claude/08-plugin-system-guide.md)
- **シンボルマップ** → [../../docs/claude/10-symbol-map-navigation.md](../../docs/claude/10-symbol-map-navigation.md)
- **開発ワークフロー** → [../../docs/claude/03-development-workflow.md](../../docs/claude/03-development-workflow.md)
- **コーディング規約** → [../../docs/claude/04-coding-conventions.md](../../docs/claude/04-coding-conventions.md)
- **品質保証** → [../../docs/claude/06-quality-assurance.md](../../docs/claude/06-quality-assurance.md)

---

**🎯 成功の鍵**: MCPツール活用 + 親プロジェクト文書の参照 + 4層テスト戦略の遵守
