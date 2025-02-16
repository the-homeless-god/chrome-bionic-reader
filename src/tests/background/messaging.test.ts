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
  });

  describe('handleStatsUpdate', () => {
    test('sends stats update message', async () => {
      const result = await handleStatsUpdate(mockStats)();

      expect(result._tag).toBe('Right');
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: config.messages.types.statsUpdated,
        data: expect.objectContaining({
          totalProcessed: mockStats.totalProcessed,
          lastProcessingTime: mockStats.lastProcessingTime,
          averageProcessingTime: mockStats.averageProcessingTime,
        }),
      });
    });

    test('handles message send error', async () => {
      chrome.runtime.sendMessage.mockImplementationOnce(() =>
        Promise.reject(new Error('Send error'))
      );

      const result = await handleStatsUpdate(mockStats)();
      expect(result._tag).toBe('Left');
      expect((result as any).left.message).toBe(`${config.errors.stats.update}: Error: Send error`);
    });
  });

  describe('handleMessage', () => {
    test('handles stats update message', async () => {
      const sendResponse = jest.fn();
      const result = handleMessage(
        { type: config.messages.types.updateStats, data: mockStats },
        {},
        sendResponse
      );

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(result).toBe(false);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: config.messages.types.statsUpdated,
        data: expect.objectContaining({
          totalProcessed: mockStats.totalProcessed,
          lastProcessingTime: mockStats.lastProcessingTime,
          averageProcessingTime: mockStats.averageProcessingTime,
        }),
      });
    });

    test('handles get stats message', async () => {
      const sendResponse = jest.fn();
      const result = handleMessage({ type: config.messages.types.getStats }, {}, sendResponse);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(result).toBe(true);
      expect(chrome.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true,
      });
    });

    test('handles reset stats message', async () => {
      const sendResponse = jest.fn();
      const result = handleMessage({ type: config.messages.types.resetStats }, {}, sendResponse);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });

    test('handles unknown message type', () => {
      const sendResponse = jest.fn();
      const result = handleMessage({ type: 'unknown' as any }, {}, sendResponse);

      expect(result).toBe(false);
      expect(sendResponse).not.toHaveBeenCalled();
    });
  });
});
