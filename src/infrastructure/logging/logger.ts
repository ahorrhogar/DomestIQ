export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export interface Logger {
  log(entry: LogEntry): void;
}

class ConsoleLogger implements Logger {
  log(entry: LogEntry): void {
    const serialized = JSON.stringify(entry);

    switch (entry.level) {
      case "error":
        console.error(serialized);
        break;
      case "warn":
        console.warn(serialized);
        break;
      case "debug":
        console.debug(serialized);
        break;
      case "info":
      default:
        console.info(serialized);
        break;
    }
  }
}

export const logger: Logger = new ConsoleLogger();
