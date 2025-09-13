# テストスイート3階層BDD構造再構成 - 詳細作業ToDo

## 📚 必須参照ドキュメント

**作業開始前に以下を必ず参照してください：**

### 🔴 最重要：引き継ぎ資料

- **[handover.md](./handover.md)** - 完全な作業仕様・実装パターン・品質基準
- **[temp/ドキュメント]** - 最新の技術情報・更新内容

### 🛠️ MCPツール必須使用によるトークン削減

**すべての作業でlsmcp・serena-mcpツールを活用してください：**

```bash
# コード理解・構造分析（トークン削減）
mcp__serena-mcp__get_symbols_overview --relative_path "[ファイルパス]"
mcp__serena-mcp__find_symbol --name_path "[シンボル名]"

# パターン検索（効率的調査）
mcp__serena-mcp__search_for_pattern --substring_pattern "[パターン]"

# LSP活用（詳細分析）
mcp__lsmcp__search_symbols --query "[検索語]"
mcp__lsmcp__get_symbol_details --relativePath "[ファイル]" --symbol "[シンボル]"
```

**トークン削減効果：**

- 既存コード読み込み回数削減（MCPツール活用）
- 重複調査回避（ドキュメント参照）
- 段階的アプローチによる効率化

---

## 📊 進捗概要

**全体進捗**: 0/156 タスク完了 (0%)

### フェーズ別進捗

- **P1** (4階層問題修正): 0/24 (0%)
- **P2** (構造統一): 0/108 (0%)
- **P3** (品質確保): 0/24 (0%)

### サブフェーズ別進捗

- **P1-S1** (問題特定): 0/6 (0%)
- **P1-S2** (MockFormatter修正): 0/12 (0%)
- **P1-S3** (その他修正): 0/6 (0%)
- **P2-S1** (Unit Tests): 0/54 (0%)
- **P2-S2** (Functional Tests): 0/24 (0%)
- **P2-S3** (Integration Tests): 0/30 (0%)
- **P3-S1** (品質検証): 0/12 (0%)
- **P3-S2** (ドキュメント更新): 0/12 (0%)

---

## 🚨 Phase 1 [P1]: 2階層BDD構造修正（最優先 - 0/24完了）

**構造変更**: TOPレベルクラス名削除 + Given/Feature直接TOP + When/Then 2階層BDD

### Subphase 1-1 [P1-S1]: 問題ファイル特定・分析 (0/6完了)

- [ ] **T001**: TOPレベルクラス名パターン検索実行
  ```bash
  # MCPツール使用（トークン削減）
  # TOPレベルクラス名のみのdescribe検索
  mcp__serena-mcp__search_for_pattern --substring_pattern "describe\(['\"]\w+['\"].*\{\s*$" --paths_include_glob "*.spec.ts"
  # 3階層以上の複雑構造検索
  mcp__serena-mcp__search_for_pattern --substring_pattern "describe.*describe.*describe" --paths_include_glob "*.spec.ts"
  ```
  - 問題ファイルリスト作成
  - 削除対象TOPレベルクラス名特定

- [ ] **T002**: MockFormatter.errorThrow.spec.ts詳細構造分析
  ```bash
  # 効率的ファイル分析
  mcp__serena-mcp__get_symbols_overview --relative_path "src/plugins/formatter/__tests__/MockFormatter.errorThrow.spec.ts"
  ```
  - 修正対象テストケース特定
  - Red-Green-Refactorサイクル計画

- [ ] **T003**: 他の4階層候補ファイル構造分析
  - AgLoggerConfig.formatterStats.spec.ts確認（MCPツール活用）
  - parseArgsToAgLogMessage.spec.ts確認（MCPツール活用）

- [ ] **T004**: 修正パターン分類・方針決定
  - パターンA: テストタイプタグ付けのみ（[正常|異常|エッジ]）
  - パターンB: TOPレベルクラス名削除 + 2階層BDD化
  - パターンC: Feature開始パターン適用（E2E/Integration向け）

- [ ] **T005**: 修正影響範囲分析
  ```bash
  # 依存関係分析
  mcp__lsmcp__find_references --relativePath "[ファイル]" --symbol "[シンボル]"
  ```
  - テスト実行順序確認

- [ ] **T006**: P1-S1サブフェーズ完了確認
  - 作業順序決定
  - リスク評価完了

### Subphase 1-2 [P1-S2]: MockFormatter.errorThrow.spec.ts 2階層BDD化 (0/12完了)

#### Red-Green-Refactorサイクル 1: 基本操作テスト群

- [ ] **T007**: [RED] 基本操作テスト構造変更準備
  ```bash
  # 現在構造詳細分析
  mcp__serena-mcp__find_symbol --name_path "should throw default mock error" --relative_path "src/plugins/formatter/__tests__/MockFormatter.errorThrow.spec.ts"
  ```
  - テスト失敗確認（構造変更前）

- [ ] **T008**: [GREEN] 基本操作テスト構造修正
  - "Then: [異常] - should throw default mock error" に変更
  - テスト成功確認

- [ ] **T009**: [REFACTOR] 基本操作テスト品質向上
  - テストコード可読性向上
  - 重複コード除去

#### Red-Green-Refactorサイクル 2: カスタムエラーテスト群

- [ ] **T010**: [RED] カスタムエラーテスト構造変更準備
  - 現在のit文: "should throw custom default error"
  - テスト失敗確認（構造変更前）

- [ ] **T011**: [GREEN] カスタムエラーテスト構造修正
  - "Then: [異常] - should throw custom default error" に変更
  - テスト成功確認

- [ ] **T012**: [REFACTOR] カスタムエラーテスト品質向上
  - テストコード最適化
  - アサーション強化

#### Red-Green-Refactorサイクル 3: エラーハンドリングテスト群

- [ ] **T013**: [RED] エラーハンドリングテスト分析
  - 残りのit文全体構造確認（MCPツール活用）
  - テスト失敗パターン特定

- [ ] **T014**: [GREEN] エラーハンドリングテスト一括修正
  - 全it文のテストタイプタグ付け
  - Given-When-Then構造確認

- [ ] **T015**: [REFACTOR] エラーハンドリングテスト総合改善
  - describe階層最適化
  - テストデータ共通化

#### Red-Green-Refactorサイクル 4: 統合・検証

- [ ] **T016**: [RED] ファイル全体統合テスト
  - 修正後の全テスト実行
  - 失敗ケース特定

- [ ] **T017**: [GREEN] 統合問題修正
  - 全テスト成功確認
  - カバレッジ維持確認

- [ ] **T018**: [REFACTOR] ファイル全体品質向上
  - コメント・ドキュメント更新
  - 命名規則統一

### Subphase 1-3 [P1-S3]: その他ファイル2階層BDD化 (0/6完了)

- [ ] **T019**: AgLoggerConfig.formatterStats.spec.ts 2階層BDD化
  ```bash
  # 効率的修正準備
  mcp__serena-mcp__get_symbols_overview --relative_path "[ファイルパス]"
  ```
  - TOPレベルクラス名削除
  - Given/Feature直接TOP配置
  - Red-Green-Refactorサイクル実行

- [ ] **T020**: parseArgsToAgLogMessage.spec.ts 2階層BDD化
  - TOPレベルクラス名削除
  - 複数Given統合 → 単一Given/Feature直接TOP
  - テストタイプタグ付け（[正常|異常|エッジ]）
  - Red-Green-Refactorサイクル実行

- [ ] **T021**: その他発見されたファイル2階層BDD化
  - TOPレベルクラス名削除対応
  - Given/Feature直接TOP適用
  - 2階層BDD構造統一

- [ ] **T022**: Phase 1全体検証テスト
  - TOPレベルクラス名完全削除確認
  - 2階層BDD構造統一確認
  - テスト実行時間計測

- [ ] **T023**: Phase 1品質確保
  - 型チェック実行：`pnpm run check:types`
  - リント確認：`pnpm run lint:all`

- [ ] **T024**: P1フェーズ完了報告書作成
  - 修正内容まとめ
  - P2準備状況確認

---

## 🏗️ Phase 2 [P2]: 2階層BDD全体統一（中優先 - 0/108完了）

**全ファイル対象**: TOPレベルクラス名削除 + Given/Feature直接TOP + テストタイプタグ付け

### Subphase 2-1 [P2-S1]: Unit Tests修正 (0/54完了)

#### Group 2-1-1: コアクラステスト群 (0/12完了)

**AgTypes.spec.ts修正**

- [ ] **T025**: [RED] AgTypes.spec.ts構造分析
  ```bash
  mcp__serena-mcp__get_symbols_overview --relative_path "src/__tests__/AgTypes.spec.ts"
  ```
- [ ] **T026**: [GREEN] テストタイプタグ付け適用
- [ ] **T027**: [REFACTOR] コード品質向上

**agManagerUtils/core.spec.ts修正**

- [ ] **T028**: [RED] core.spec.ts構造分析
- [ ] **T029**: [GREEN] 3階層BDD構造適用
- [ ] **T030**: [REFACTOR] テスト最適化

**agManagerUtils/methodReplacement.spec.ts修正**

- [ ] **T031**: [RED] methodReplacement.spec.ts構造分析
- [ ] **T032**: [GREEN] 3階層BDD構造適用
- [ ] **T033**: [REFACTOR] テスト最適化

**検証・統合**

- [ ] **T034**: コアクラステスト群統合実行
- [ ] **T035**: カバレッジ・パフォーマンス確認
- [ ] **T036**: Group 2-1-1完了確認

#### Group 2-1-2: プラグインユニットテスト群 (0/24完了)

**Formatter Plugin Tests (8ファイル)**

- [ ] **T037**: JsonFormatter.spec.ts構造統一
  ```bash
  mcp__lsmcp__search_symbols --query "JsonFormatter" --file "src/plugins/formatter/__tests__"
  ```
- [ ] **T038**: PlainFormatter.spec.ts構造統一
- [ ] **T039**: units/plugins/formatter/JsonFormatter.spec.ts修正
- [ ] **T040**: units/plugins/formatter/PlainFormatter.spec.ts修正
- [ ] **T041**: AgMockFormatter.spec.ts構造統一
- [ ] **T042**: MockFormatter.spec.ts構造統一
- [ ] **T043**: NullFormatter.spec.ts構造統一
- [ ] **T044**: formatter群統合テスト実行

**Logger Plugin Tests (9ファイル)**

- [ ] **T045**: E2eMockLogger.spec.ts構造統一
- [ ] **T046**: units/ConsoleLogger.spec.ts構造統一
- [ ] **T047**: units/E2eMockLogger.spec.ts構造統一
- [ ] **T048**: units/MockLogger.spec.ts構造統一
- [ ] **T049**: units/NullLogger.spec.ts構造統一
- [ ] **T050**: logger群統合テスト実行

**Utils Tests (7ファイル)**

- [ ] **T051**: AgLogHelpers.spec.ts構造統一
- [ ] **T052**: AgLogValidators.spec.ts構造統一
- [ ] **T053**: その他utilsテスト構造統一
- [ ] **T054**: utils群統合テスト実行

**プラグイン全体検証**

- [ ] **T055**: プラグインテスト群全体実行
- [ ] **T056**: 相互依存関係確認
- [ ] **T057**: パフォーマンス影響確認
- [ ] **T058**: Group 2-1-2完了確認

#### Group 2-1-3: Unit Tests品質確保 (0/18完了)

**個別品質チェック**

- [ ] **T059**: 全Unit Testsテストタイプタグ付け確認
- [ ] **T060**: 3階層BDD構造遵守確認
- [ ] **T061**: Given-When-Then明確化確認

**統合品質チェック**

- [ ] **T062**: Unit Tests全体実行（Sequential）
- [ ] **T063**: 型チェック問題なし確認
- [ ] **T064**: リント問題なし確認
- [ ] **T065**: カバレッジ維持確認

**回帰テスト**

- [ ] **T066**: シングルトンリセット動作確認
- [ ] **T067**: モック状態分離確認
- [ ] **T068**: テスト実行順序依存なし確認

**ドキュメント・報告**

- [ ] **T069**: Unit Tests修正内容記録
- [ ] **T070**: 発見された問題点記録
- [ ] **T071**: ベストプラクティス抽出
- [ ] **T072**: P2-S1サブフェーズ完了報告

**最終検証**

- [ ] **T073**: Unit Tests全27ファイル構造統一確認
- [ ] **T074**: テスト実行時間基準値内確認
- [ ] **T075**: 次サブフェーズ準備完了
- [ ] **T076**: P2-S1サブフェーズ完了承認

### Subphase 2-2 [P2-S2]: Functional Tests修正 (0/24完了)

#### Group 2-2-1: 優良実装維持 (0/12完了)

**AgLogger.functional.spec.ts (既に良好)**

- [ ] **T077**: [RED] 既存構造詳細確認
  ```bash
  # 優良実装確認（handover.md参照）
  mcp__serena-mcp__get_symbols_overview --relative_path "src/__tests__/functional/AgLogger.functional.spec.ts"
  ```
- [ ] **T078**: [GREEN] テストタイプタグ付けのみ実施
- [ ] **T079**: [REFACTOR] コメント・ドキュメント改善

**AgLoggerManager.functional.spec.ts (既に良好)**

- [ ] **T080**: [RED] 既存構造詳細確認
- [ ] **T081**: [GREEN] テストタイプタグ付けのみ実施
- [ ] **T082**: [REFACTOR] コメント・ドキュメント改善

**統合・検証**

- [ ] **T083**: 優良実装2ファイル統合実行
- [ ] **T084**: BDD構造模範例として品質確認
- [ ] **T085**: 他ファイルへの参考パターン抽出
- [ ] **T086**: Group 2-2-1完了確認

#### Group 2-2-2: 要修正ファイル対応 (0/12完了)

**features/plainOutput.functional.spec.ts**

- [ ] **T087**: [RED] 現在構造分析・問題特定
  ```bash
  mcp__serena-mcp__find_symbol --name_path "plainOutput" --relative_path "src/__tests__/functional/features"
  ```
- [ ] **T088**: [GREEN] 3階層BDD構造適用
- [ ] **T089**: [REFACTOR] 機能テスト品質向上

**internal/AgLoggerConfig.functional.spec.ts**

- [ ] **T090**: [RED] 現在構造分析・問題特定
- [ ] **T091**: [GREEN] 3階層BDD構造適用
- [ ] **T092**: [REFACTOR] 設定テスト品質向上

**統合・検証**

- [ ] **T093**: 要修正2ファイル統合実行
- [ ] **T094**: 修正内容品質確認
- [ ] **T095**: functional全体統合実行
- [ ] **T096**: P2-S2サブフェーズ完了確認

### Subphase 2-3 [P2-S3]: Integration Tests修正 (0/30完了)

#### Group 2-3-1: Console Output Integration (0/9完了)

**combinations/console-plugin-combinations.integration.spec.ts**

- [ ] **T097**: [RED] Console組み合わせテスト分析
  ```bash
  mcp__lsmcp__search_symbols --query "console-plugin-combinations" --file "tests/integration/console-output"
  ```
- [ ] **T098**: [GREEN] Feature-When-Then構造適用
- [ ] **T099**: [REFACTOR] 統合テスト品質向上

**loggers/console-logger-behavior.integration.spec.ts**

- [ ] **T100**: [RED] Consoleロガー動作テスト分析
- [ ] **T101**: [GREEN] 3階層BDD構造適用
- [ ] **T102**: [REFACTOR] 動作テスト最適化

**統合・検証**

- [ ] **T103**: Console Output統合テスト全実行
- [ ] **T104**: 実際のConsole出力確認
- [ ] **T105**: Group 2-3-1完了確認

#### Group 2-3-2: Mock Output Integration (0/21完了)

**Core Tests (3ファイル)**

- [ ] **T106**: core/configuration-behavior.integration.spec.ts修正
- [ ] **T107**: data-processing/complex-data-handling.integration.spec.ts修正
- [ ] **T108**: data-processing/filtering-behavior.integration.spec.ts修正

**Manager Tests (3ファイル)**

- [ ] **T109**: manager/error-handling.integration.spec.ts修正
- [ ] **T110**: manager/logger-map-management.integration.spec.ts修正
- [ ] **T111**: manager/singleton-management.integration.spec.ts (既に良好・タグ付けのみ)
  ```bash
  # 優良実装確認（handover.md記載）
  mcp__serena-mcp__get_symbols_overview --relative_path "tests/integration/mock-output/manager/singleton-management.integration.spec.ts"
  ```

**Performance Tests (3ファイル)**

- [ ] **T112**: performance/high-load-behavior.integration.spec.ts修正
- [ ] **T113**: plugins/combinations/comprehensive-integration.integration.spec.ts修正
- [ ] **T114**: plugins/combinations/mock-plugin-combinations.integration.spec.ts修正

**Formatter Tests (3ファイル)**

- [ ] **T115**: plugins/formatters/error-handling-behavior.integration.spec.ts修正
- [ ] **T116**: plugins/formatters/formatter-types-behavior.integration.spec.ts修正
- [ ] **T117**: utils/test-isolation-patterns.integration.spec.ts修正

**Mock統合検証 (9タスク)**

- [ ] **T118**: Mock Output Core群統合実行
- [ ] **T119**: Mock Output Manager群統合実行
- [ ] **T120**: Mock Output Performance群統合実行
- [ ] **T121**: Mock Output Plugins群統合実行
- [ ] **T122**: Mock Output Utils群統合実行
- [ ] **T123**: Mock Output全体統合実行
- [ ] **T124**: Mock統合テストパフォーマンス確認
- [ ] **T125**: Mock統合テストカバレッジ確認
- [ ] **T126**: P2-S3サブフェーズ完了確認

---

## 🎯 Phase 3 [P3]: 品質確保・最終検証（低優先 - 0/24完了）

### Subphase 3-1 [P3-S1]: 全体品質検証 (0/12完了)

**構造検証**

- [ ] **T127**: 全53ファイル3階層構造遵守確認
  ```bash
  # 全体構造検証
  mcp__serena-mcp__search_for_pattern --substring_pattern "describe.*describe.*describe.*describe" --paths_include_glob "*.spec.ts"
  # 結果が0件であることを確認
  ```
- [ ] **T128**: Given/Feature-When-Then統一確認
- [ ] **T129**: テストタイプタグ付け完全性確認

**動作検証**

- [ ] **T130**: 全テストファイル順次実行確認
- [ ] **T131**: Sequential実行問題なし確認
- [ ] **T132**: シングルトン状態管理正常確認

**品質メトリクス**

- [ ] **T133**: テストカバレッジ基準値維持確認
- [ ] **T134**: テスト実行時間基準値内確認
- [ ] **T135**: メモリ使用量問題なし確認

**最終統合テスト**

- [ ] **T136**: 全階層テスト（Unit→Functional→Integration→E2E）実行
- [ ] **T137**: 型チェック・リント問題完全解消確認
- [ ] **T138**: P3-S1サブフェーズ完了確認

### Subphase 3-2 [P3-S2]: ドキュメント・記録更新 (0/12完了)

**メモリ更新**

- [ ] **T139**: test_structure_patterns_2025メモリ更新
  ```bash
  mcp__serena-mcp__write_memory --memory_name "test_structure_patterns_2025" --content "[更新内容]"
  ```
- [ ] **T140**: 新しいBDD構造パターン追加
- [ ] **T141**: 統計情報・メトリクス更新

**ドキュメント更新**

- [ ] **T142**: handover.md実施結果反映
- [ ] **T143**: CLAUDE.md関連情報更新
- [ ] **T144**: 開発プロセス改善点記録

**実績記録**

- [ ] **T145**: 修正ファイル一覧・変更内容詳細記録
- [ ] **T146**: 発見された問題・解決方法記録
- [ ] **T147**: ベストプラクティス・アンチパターン整理

**引き継ぎ準備**

- [ ] **T148**: 今後の保守・拡張ガイドライン作成
- [ ] **T149**: 新規テスト作成時のテンプレート整備
- [ ] **T150**: プロジェクト完了報告書作成

---

## 🎛️ 実行指示システム

### ID指定実行コマンド

#### フェーズ単位実行

```bash
# Phase 1全体実行
./execute-phase.sh P1

# Phase 2全体実行  
./execute-phase.sh P2

# Phase 3全体実行
./execute-phase.sh P3
```

#### サブフェーズ単位実行

```bash
# P1のサブフェーズ1実行
./execute-subphase.sh P1-S1

# P2のサブフェーズ2実行
./execute-subphase.sh P2-S2

# 任意のサブフェーズ実行
./execute-subphase.sh [P1-S1|P1-S2|P1-S3|P2-S1|P2-S2|P2-S3|P3-S1|P3-S2]
```

#### 個別タスク実行

```bash
# 特定タスク実行
./execute-task.sh T001

# タスク範囲実行
./execute-task-range.sh T001 T006

# Red-Green-Refactorサイクル実行
./execute-cycle.sh T007 T009  # T007-T009をサイクルとして実行
```

### 進捗確認コマンド

```bash
# 全体進捗確認
./check-progress.sh

# フェーズ別進捗確認
./check-phase-progress.sh P1

# サブフェーズ別進捗確認  
./check-subphase-progress.sh P2-S1
```

---

## 📋 実行ガイドライン

### Red-Green-Refactorサイクル実行手順

#### RED段階

1. **MCPツール活用による効率的分析**
   ```bash
   mcp__serena-mcp__get_symbols_overview --relative_path "[ファイルパス]"
   ```
2. 既存テストの現在構造を詳細分析
3. 修正によるテスト失敗を意図的に作成
4. 失敗原因・影響範囲を明確化

#### GREEN段階

1. 最小限の変更でテスト成功させる
2. 3階層BDD構造・テストタイプタグ適用
3. 全テスト成功を確認
4. **MCPツールで品質確認**
   ```bash
   mcp__lsmcp__get_diagnostics --relativePath "[ファイル]"
   ```

#### REFACTOR段階

1. コード品質向上（可読性・保守性）
2. 重複除去・命名統一
3. テスト成功維持を確認
4. **最終品質確認**
   ```bash
   pnpm run check:types && pnpm run lint:all
   ```

### タスク実行時の注意事項

#### 必須確認項目

- [ ] シングルトンリセット正常動作
- [ ] テスト間の状態分離
- [ ] Sequential実行での成功
- [ ] 型チェック・リント問題なし

#### 品質基準

- [ ] テストカバレッジ低下なし
- [ ] 実行時間大幅増加なし（+10%以内）
- [ ] メモリリーク発生なし
- [ ] BDD構造・命名規則遵守

#### MCPツール活用によるトークン削減

- [ ] コード読み込み前にget_symbols_overview実行
- [ ] パターン検索でsearch_for_pattern活用
- [ ] 既存ドキュメント（handover.md）参照
- [ ] 重複調査回避

### 緊急時対応

#### テスト破綻時

1. 直前のタスクまで戻る
2. 問題原因を特定・記録
3. MCPツールで詳細分析
4. 修正方針を再検討
5. 段階的に復旧作業実行

#### パフォーマンス劣化時

1. 修正内容を一時退避
2. 劣化原因を分析・特定
3. 最適化方針を決定
4. 段階的に最適化実行

---

## 📊 進捗追跡・報告

### 日次進捗報告

- 完了タスク数・進捗率
- 発見された問題・解決内容
- 翌日実行予定タスク
- MCPツール使用によるトークン削減効果

### フェーズ完了時報告

- フェーズ目標達成状況
- 品質メトリクス結果
- 次フェーズ実行可否判断
- 効率化改善点

### プロジェクト完了時報告

- 全体達成度・品質確保状況
- プロジェクト成果・改善効果
- 今後の保守・拡張方針
- トークン削減・効率化成果

---

**このToDo.mdにより、handover.mdに基づく156個の詳細タスクを、MCPツール活用によるトークン削減を実現しながら、段階的・確実に実行し、テストスイートを3階層BDD構造に完全移行できます。**
