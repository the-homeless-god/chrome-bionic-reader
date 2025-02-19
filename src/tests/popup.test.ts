import * as TE from 'fp-ts/TaskEither';
import { chrome } from './mocks/chrome';
import config from '@/config';
import { handleMessage, initialize } from '@/popup';
import { Stats } from '@/types';

jest.mock('@/services/stats', () => {
  const mockResetStats = jest.fn().mockReturnValue(TE.right(undefined));
  const mockUpdateStats = jest.fn().mockReturnValue(TE.right(undefined));
  const mockStats: Stats = {
    totalProcessed: 100,
    lastProcessingTime: 50,
    averageProcessingTime: 50,
    sessionStartTime: Date.now(),
  };

  return {
    formatSessionTime: () => '1h 30m',
    resetStats: mockResetStats,
    updateStats: mockUpdateStats,
    getStats: () => mockStats,
  };
});

const { resetStats: mockResetStats, getStats } = jest.requireMock('@/services/stats');
const mockStats = getStats();

describe('Popup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <div id="${config.dom.selectors.processedWords}">0</div>
      <div id="${config.dom.selectors.averageTime}">0</div>
      <div id="${config.dom.selectors.sessionInfo}">0h 0m</div>
      <button id="${config.dom.selectors.resetButton}"></button>
    `;
    chrome.runtime.sendMessage.mockImplementation(() => Promise.resolve());
  });

  describe('Message Handling', () => {
    test('processes update stats message', () => {
      handleMessage({
        type: config.messages.types.updateStats,
        data: mockStats,
      });

      expect(document.getElementById(config.dom.selectors.processedWords)?.textContent).toBe(
        mockStats.totalProcessed.toString()
      );
    });

    test('ignores other message types', () => {
      const originalContent = document.getElementById(
        config.dom.selectors.processedWords
      )?.textContent;
      handleMessage({ type: config.messages.types.getStats });
      expect(document.getElementById(config.dom.selectors.processedWords)?.textContent).toBe(
        originalContent
      );
    });
  });

  describe('Reset Functionality', () => {
    test('resets statistics when button clicked', async () => {
      initialize();
      const resetButton = document.getElementById(config.dom.selectors.resetButton);

      if (resetButton) {
        resetButton.click();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(mockResetStats).toHaveBeenCalled();
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
          type: config.messages.types.resetStats,
        });
      }
    });
  });

  describe('Initialization', () => {
    test('updates UI with initial stats', async () => {
      const mockTime = Date.now();
      const mockStats = {
        totalProcessed: 100,
        lastProcessingTime: 50,
        averageProcessingTime: 50,
        sessionStartTime: mockTime - 5400000, // 1.5 hour ago
      };

      handleMessage({
        type: config.messages.types.updateStats,
        data: mockStats,
      });
      initialize();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(document.getElementById(config.dom.selectors.processedWords)?.textContent).toBe(
        mockStats.totalProcessed.toString()
      );
      expect(document.getElementById(config.dom.selectors.averageTime)?.textContent).toBe(
        mockStats.averageProcessingTime.toString()
      );
      expect(document.getElementById(config.dom.selectors.sessionInfo)?.textContent).toBe('1h 30m');
    });

    test('handles initialization errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      chrome.runtime.sendMessage.mockImplementationOnce(() =>
        Promise.reject(new Error('Initialization error'))
      );

      initialize();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
