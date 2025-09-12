//
// Copyright (C) 2025 atsushifx
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// types
import type { AgFormatRoutine } from '../../../shared/types/AgMockConstructor.class';

// plugins
import { AgMockFormatter } from './AgMockFormatter';

/**
 * ErrorThrowFormatter - 実行時にエラーメッセージを変更可能なフォーマッタ
 * AgMockFormatterを拡張し、setErrorMessageによる動的エラーメッセージ変更をサポート
 */
export class ErrorThrowFormatter extends AgMockFormatter {
  // static readonly __isMockConstructor = true as const;
  private currentErrorMessage: string;

  constructor(routine?: AgFormatRoutine, defaultErrorMessage = 'Default mock error') {
    // AgLoggerConfigからの呼び出しに対応
    // routineが渡されても無視し、エラールーチンを使用

    // エラーメッセージをクロージャで保持するため、先に変数に保存
    let errorMessage = defaultErrorMessage;

    // エラールーチン：保存したエラーメッセージでErrorを投げる
    const errorRoutine: AgFormatRoutine = (_msg) => {
      throw new Error(errorMessage);
    };

    super(errorRoutine);

    // super()後にthisにアクセス可能
    this.currentErrorMessage = defaultErrorMessage;

    // setErrorMessageでクロージャの変数も更新するため、メソッドをオーバーライド
    this.setErrorMessage = (newErrorMessage: string) => {
      this.currentErrorMessage = newErrorMessage;
      errorMessage = newErrorMessage;
    };
  }

  /**
   * 実行時にエラーメッセージを動的に変更
   * @param errorMessage - 新しいエラーメッセージ
   */
  setErrorMessage(errorMessage: string): void {
    this.currentErrorMessage = errorMessage;
  }

  /**
   * 現在のエラーメッセージを取得
   * @returns 現在設定されているエラーメッセージ
   */
  getErrorMessage(): string {
    return this.currentErrorMessage;
  }
}
