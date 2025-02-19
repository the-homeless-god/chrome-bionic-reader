import { chrome } from '../mocks/chrome';
import config from '@/config';
import { handleMessage, handleStatsUpdate } from '@/background/messaging';
import { Stats } from '@/types';

const mockStats: Stats = {
  totalProcessed: 100,
  lastProcessingTime: 50,
  averageProcessingTime: 50,
  sessionStartTime: Date.now(),
};

describe('Messaging Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chrome.runtime.sendMessage.mockImplementation(() => Promise.resolve());
    chrome.tabs.query.mockImplementation(() => Promise.resolve([{ id: 1 }]));
    chrome.scripting.executeScript.mockImplementation(() =>
      Promise.resolve([{ result: undefined }])
    );
    chrome.storage.local.set.mockImplementation(() => Promise.resolve());
    chrome.storage.local.get.mockImplementation(() => Promise.resolve({ enabled: true }));
  });

  describe('handleStatsUpdate', () => {
    test('sends stats update message', async () => {
      const result = await handleStatsUpdate(mockStats)();
      expect(result).toBeDefined();
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: config.messages.types.statsUpdated,
        data: mockStats,
      });
    });

    test('handles errors', async () => {
      const error = new Error('Update error');
      chrome.runtime.sendMessage.mockRejectedValueOnce(error as never);
      const result = await handleStatsUpdate(mockStats)();
      expect(result._tag).toBe('Left');
    });
  });

  describe('handleMessage', () => {
    test('handles updateStats message', async () => {
      const sendResponse = jest.fn();
      const result = handleMessage(
        { type: config.messages.types.updateStats, data: mockStats },
        {},
        sendResponse
      );

      expect(result).toBe(false);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(chrome.runtime.sendMessage).toHaveBeenCalled();
    });

    test('handles getStats message', async () => {
      const sendResponse = jest.fn();
      const result = handleMessage({ type: config.messages.types.getStats }, {}, sendResponse);

      expect(result).toBe(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(chrome.tabs.query).toHaveBeenCalled();
    });

    test('handles resetStats message', async () => {
      const sendResponse = jest.fn();
      const result = handleMessage({ type: config.messages.types.resetStats }, {}, sendResponse);

      expect(result).toBe(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });

    test('handles getState message', async () => {
      const sendResponse = jest.fn();
      const state = true;
      chrome.storage.local.get.mockImplementation((_keys, callback) => {
        callback?.({ [config.storage.keys.enabled]: state });
        return Promise.resolve({ [config.storage.keys.enabled]: state });
      });

      handleMessage({ type: config.messages.types.getState }, {}, sendResponse);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(chrome.storage.local.get).toHaveBeenCalledWith(
        [config.storage.keys.enabled],
        expect.any(Function)
      );
      expect(sendResponse).toHaveBeenCalledWith(state);
    });

    test('handles errors in updateStats', async () => {
      const error = new Error('Update error');
      chrome.runtime.sendMessage.mockRejectedValueOnce(error as never);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const sendResponse = jest.fn();
      handleMessage({ type: config.messages.types.updateStats, data: mockStats }, {}, sendResponse);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('handles errors in getStats', async () => {
      const error = new Error('Query error');
      chrome.tabs.query.mockRejectedValueOnce(error as never);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const sendResponse = jest.fn();
      handleMessage({ type: config.messages.types.getStats }, {}, sendResponse);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(consoleSpy).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
