// src/plugins/logger/_bufferLogger.ts
// @(#) : Mock Logger for Unit and Integration Testing
//
// Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// libs
import type { AgLoggerMethodsInterface } from '../../utils/AgLoggerMethod';
import { bindLoggerMethods } from '../../utils/AgLoggerMethod';
import { isValidLogLevel } from '../../utils/AgLogValidators';

import { NullLogger } from './NullLogger';

// constants
import { AG_LOGLEVEL, AG_LOGLEVEL_KEYS, AG_LOGLEVEL_VALUES } from '../../../shared/types';
// types
import type {
  AgFormattedLogMessage,
  AgLoggerFunction,
  AgLoggerMap,
  AgLogLevel,
  AgLogLevelLabel,
  AgLogMessage,
} from '../../../shared/types';

/**
 * Universal mock logger for unit and integration testing.
 * Provides message capture and verification capabilities for all test types.
 *
 * Features:
 * - Fast execution for unit and integration tests
 * - Component interaction verification
 * - Synchronous operations only
 * - Thread-safe for single-threaded test scenarios
 * - Deep immutability for message objects
 */
export class AgMockBufferLogger implements AgLoggerMethodsInterface {
  public defaultLoggerMap: AgLoggerMap;
  [key: string]: unknown;

  constructor() {
    this.defaultLoggerMap = this.createLoggerMap();
    bindLoggerMethods(this);
  }

  private messages: Map<AgLogLevel, AgFormattedLogMessage[]> = new Map(
    AG_LOGLEVEL_VALUES.map((level) => [level, []]),
  );

  /**
   * Validates if the provided log level is valid.
   * @param logLevel - The log level to validate
   * @throws {Error} When log level is invalid
   */
  private validateLogLevel(logLevel: AgLogLevel): void {
    if (!isValidLogLevel(logLevel)) {
      throw new Error(`MockLogger: Invalid log level: ${String(logLevel)}`);
    }
  }

  // Logger methods
  public executeLog(level: AgLogLevel, message: AgFormattedLogMessage): void {
    this.validateLogLevel(level);
    this.messages.get(level)!.push(message);
  }

  fatal(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.FATAL, message);
  }

  error(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.ERROR, message);
  }

  warn(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.WARN, message);
  }

  info(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.INFO, message);
  }

  debug(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.DEBUG, message);
  }

  trace(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.TRACE, message);
  }

  verbose(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.VERBOSE, message);
  }

  log(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.LOG, message);
  }

  default(message: AgFormattedLogMessage): void {
    this.executeLog(AG_LOGLEVEL.DEFAULT, message);
  }

  // Query methods
  getMessages(logLevel?: AgLogLevel): AgFormattedLogMessage[] {
    const levelToUse = (arguments.length === 0)
      ? AG_LOGLEVEL.DEFAULT
      : (logLevel as unknown as AgLogLevel);
    this.validateLogLevel(levelToUse);
    return this.messages.get(levelToUse)?.slice() ?? [];
  }

  getLastMessage(logLevel?: AgLogLevel): AgLogMessage | string | null {
    const levelToUse = (arguments.length === 0)
      ? AG_LOGLEVEL.DEFAULT
      : (logLevel as unknown as AgLogLevel);
    this.validateLogLevel(levelToUse);
    return this.messages.get(levelToUse)?.slice(-1)[0] ?? null;
  }

  getAllMessages(): { [K in AgLogLevelLabel]: AgFormattedLogMessage[] } {
    return AG_LOGLEVEL_KEYS.reduce((acc, key) => ({
      ...acc,
      [key]: this.messages.get(AG_LOGLEVEL[key])?.slice() ?? [],
    }), {} as { [K in AgLogLevelLabel]: AgFormattedLogMessage[] });
  }

  // Utility methods
  clearMessages(logLevel: AgLogLevel): void {
    this.validateLogLevel(logLevel);
    this.messages.set(logLevel, []);
  }

  clearAllMessages(): void {
    (Object.values(AG_LOGLEVEL) as AgLogLevel[]).forEach((level) => {
      this.messages.set(level, []);
    });
  }

  reset(): void {
    this.clearAllMessages();
  }

  getMessageCount(logLevel?: AgLogLevel): number {
    const levelToUse = (arguments.length === 0)
      ? AG_LOGLEVEL.DEFAULT
      : (logLevel as unknown as AgLogLevel);
    this.validateLogLevel(levelToUse);
    return this.messages.get(levelToUse)!.length;
  }

  getTotalMessageCount(): number {
    let total = 0;
    for (const levelMessages of this.messages.values()) {
      total += levelMessages.length;
    }
    return total;
  }

  hasMessages(logLevel?: AgLogLevel): boolean {
    const levelToUse = (arguments.length === 0)
      ? AG_LOGLEVEL.DEFAULT
      : (logLevel as unknown as AgLogLevel);
    this.validateLogLevel(levelToUse);
    return this.messages.get(levelToUse)!.length > 0;
  }

  hasAnyMessages(): boolean {
    for (const levelMessages of this.messages.values()) {
      if (levelMessages.length > 0) { return true; }
    }
    return false;
  }

  /**
   * Gets the logger function for a specific log level.
   * @param logLevel - The log level to get the logger function for
   * @returns The logger function for the specified level
   */
  getLoggerFunction(logLevel?: AgLogLevel): AgLoggerFunction {
    const levelToUse = (arguments.length === 0)
      ? AG_LOGLEVEL.DEFAULT
      : (logLevel as unknown as AgLogLevel);
    this.validateLogLevel(levelToUse);
    return this.defaultLoggerMap[levelToUse] ?? NullLogger;
  }

  /**
   * Create AgLoggerMap for testing.
   * This provides level-specific logging functions.
   */
  createLoggerMap(): AgLoggerMap {
    const _loggerMap = Object.fromEntries(
      (Object.values(AG_LOGLEVEL) as AgLogLevel[]).map((level) => [
        level,
        level === AG_LOGLEVEL.OFF
          ? NullLogger
          : ((message: AgFormattedLogMessage): void => this.executeLog(level, message)).bind(this),
      ]),
    ) as AgLoggerMap;
    _loggerMap[AG_LOGLEVEL.DEFAULT] = this.default.bind(this);
    return _loggerMap;
  }
}
// other functions

// Export for backward compatibility
export const MockLogger = {
  buffer: AgMockBufferLogger,
  throwError: (errorMessage: string): AgLoggerFunction => {
    return () => {
      throw new Error(errorMessage);
    };
  },
} as const;
