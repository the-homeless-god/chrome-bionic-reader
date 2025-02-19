import config from '@/config';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const formatMessage = (level: LogLevel, message: string, ..._args: any[]): string => {
  return `${config.debug.prefix} [${level.toUpperCase()}] ${message}`;
};

export const log = {
  info: (message: string, ...args: any[]): void => {
    if (config.debug.enabled) {
      console.info(formatMessage('info', message), ...args);
    }
  },
  warn: (message: string, ...args: any[]): void => {
    if (config.debug.enabled) {
      console.warn(formatMessage('warn', message), ...args);
    }
  },
  error: (message: string, ...args: any[]): void => {
    if (config.debug.enabled) {
      console.error(formatMessage('error', message), ...args);
    }
  },
  debug: (message: string, ...args: any[]): void => {
    if (config.debug.enabled) {
      console.debug(formatMessage('debug', message), ...args);
    }
  },
}; 
