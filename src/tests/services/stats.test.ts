import { chrome } from '../mocks/chrome';
import config from '@/config';
import {
  formatSessionTime,
  updateStats,
  resetStats,
  getStats,
  updateTabStats,
} from '@/services/stats';
import { Stats } from '@/types';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';

const mockStats: Stats = {
  totalProcessed: 100,
  lastProcessingTime: 50,
  averageProcessingTime: 50,
  sessionStartTime: Date.now(),
};

describe('Stats Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatSessionTime', () => {
    test('formats time correctly', () => {
      const now = Date.now();
      const oneHourAgo = now - config.time.hour;
      const result = formatSessionTime(oneHourAgo);
      expect(result).toBe('1h 0m');
    });

    test('handles zero time', () => {
      const result = formatSessionTime(0);
      expect(result).toBe(config.constants.emptyString);
    });

    test('handles future time', () => {
      const futureTime = Date.now() + config.time.hour;
      const result = formatSessionTime(futureTime);
      expect(result).toBe(config.constants.emptyString);
    });
  });

  describe('updateStats', () => {
    test('updates stats successfully', async () => {
      const result = await pipe(
        updateStats(mockStats),
        TE.fold(
          () => T.of(false),
          () => T.of(true)
        )
      )();

      expect(result).toBe(true);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: config.messages.types.updateStats,
        data: mockStats,
      });
    });

    test('handles update errors', async () => {
      chrome.runtime.sendMessage.mockImplementationOnce(() =>
        Promise.reject(new Error('Update error'))
      );

      const result = await pipe(
        updateStats(mockStats),
        TE.fold(
          () => T.of(false),
          () => T.of(true)
        )
      )();

      expect(result).toBe(false);
    });
  });

  describe('resetStats', () => {
    test('resets stats successfully', async () => {
      const result = await pipe(
        resetStats(),
        TE.fold(
          () => T.of(false),
          () => T.of(true)
        )
      )();

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [config.storage.keys.stats]: config.storage.defaultStats,
      });
    });

    test('handles reset errors', async () => {
      chrome.storage.local.set.mockImplementationOnce(() =>
        Promise.reject(new Error('Reset error'))
      );

      const result = await pipe(
        resetStats(),
        TE.fold(
          () => T.of(false),
          () => T.of(true)
        )
      )();

      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    test('gets stats for existing tab', () => {
      const tabStats = new Map<number, Stats>();
      tabStats.set(1, mockStats);

      const result = getStats(1, tabStats);
      expect(result).toEqual(mockStats);
    });

    test('returns default stats for non-existing tab', () => {
      const tabStats = new Map<number, Stats>();
      const result = getStats(1, tabStats);
      expect(result).toEqual(config.storage.defaultStats);
    });

    test('returns default stats for undefined tab', () => {
      const tabStats = new Map<number, Stats>();
      const result = getStats(undefined, tabStats);
      expect(result).toEqual(config.storage.defaultStats);
    });
  });

  describe('updateTabStats', () => {
    test('updates tab stats successfully', async () => {
      const tabStats = new Map<number, Stats>();

      const result = await pipe(
        updateTabStats(1, mockStats, tabStats),
        TE.fold(
          () => T.of(false),
          () => T.of(true)
        )
      )();

      expect(result).toBe(true);
      expect(tabStats.get(1)).toEqual(mockStats);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: config.messages.types.statsUpdated,
        data: mockStats,
      });
    });

    test('handles update errors', async () => {
      const tabStats = new Map<number, Stats>();
      chrome.runtime.sendMessage.mockImplementationOnce(() =>
        Promise.reject(new Error('Update error'))
      );

      const result = await pipe(
        updateTabStats(1, mockStats, tabStats),
        TE.fold(
          () => T.of(false),
          () => T.of(true)
        )
      )();

      expect(result).toBe(false);
      expect(tabStats.get(1)).toEqual(mockStats);
    });
  });
});
