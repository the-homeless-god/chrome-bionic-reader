import { chrome } from '../mocks/chrome';
import config from '@/config';
import { updateStats } from '@/content/stats';

describe('Content Stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('updates stats correctly', () => {
    updateStats(100, 50);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: config.messages.types.updateStats,
      data: {
        totalProcessed: 100,
        lastProcessingTime: 50,
        averageProcessingTime: 50,
        sessionStartTime: expect.any(Number),
      },
    });
  });

  test('handles zero values', () => {
    updateStats(0, 0);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: config.messages.types.updateStats,
      data: {
        totalProcessed: 0,
        lastProcessingTime: 0,
        averageProcessingTime: 0,
        sessionStartTime: expect.any(Number),
      },
    });
  });

  test('handles negative values', () => {
    updateStats(-1, -1);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: config.messages.types.updateStats,
      data: {
        totalProcessed: -1,
        lastProcessingTime: -1,
        averageProcessingTime: -1,
        sessionStartTime: expect.any(Number),
      },
    });
  });
});
