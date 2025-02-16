import { chrome, createMockStorageWithCallback } from './mocks/chrome';
import config from '@/config';
import { initialize } from '@/background';
import { handleMessage } from '@/background/messaging';
import { initializeStorage, getStorageState, updateStorage } from '@/background/storage';
import { executeContentScript, getCurrentTab } from '@/background/tabs';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import { Stats } from '@/types';

const mockStats: Stats = {
  totalProcessed: 100,
  lastProcessingTime: 50,
  averageProcessingTime: 50,
  sessionStartTime: Date.now(),
};

describe('Background Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chrome.storage.local.get.mockImplementation(createMockStorageWithCallback(true));
    chrome.storage.local.set.mockImplementation(() => Promise.resolve());
    chrome.runtime.sendMessage.mockImplementation(() => Promise.resolve());
    chrome.tabs.query.mockImplementation(() => Promise.resolve([{ id: 1, active: true }]));
    chrome.scripting.executeScript.mockImplementation(() => Promise.resolve([{ result: undefined }]));
  });

  describe('Storage Management', () => {
    test('updates storage with new state', async () => {
      const result = await pipe(
        updateStorage(true),
        TE.fold(
          () => T.of(false),
          () => T.of(true)
        )
      )();

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [config.storage.keys.enabled]: true,
      });
    });

    test('gets storage state', async () => {
      const result = await pipe(
        getStorageState(),
        TE.fold(
          () => T.of(false),
          (state) => T.of(state)
        )
      )();

      expect(result).toBe(true);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(
        [config.storage.keys.enabled],
        expect.any(Function)
      );
    });

    test('initializes storage', async () => {
      await pipe(
        initializeStorage(),
        TE.fold(
          () => T.of(false),
          () => T.of(true)
        )
      )();

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [config.storage.keys.enabled]: config.storage.defaultState,
      });
    });
  });

  describe('Tab Management', () => {
    test('gets current tab', async () => {
      const result = await pipe(
        getCurrentTab(),
        TE.fold(
          () => T.of(undefined),
          (tab) => T.of(tab)
        )
      )();

      expect(result).toEqual({ id: 1, active: true });
      expect(chrome.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true,
      });
    });

    test('executes content script', async () => {
      const result = await pipe(
        executeContentScript(1),
        TE.fold(
          () => T.of(false),
          () => T.of(true)
        )
      )();

      expect(result).toBe(true);
      expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 1 },
        func: expect.any(Function),
      });
    });
  });

  describe('Message Handling', () => {
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
      const result = handleMessage(
        { type: config.messages.types.getStats },
        {},
        sendResponse
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result).toBe(true);
      expect(chrome.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true,
      });
    });

    test('handles reset stats message', async () => {
      const sendResponse = jest.fn();
      const result = handleMessage(
        { type: config.messages.types.resetStats },
        {},
        sendResponse
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [config.storage.keys.enabled]: false,
      });
    });
  });

  describe('Initialization', () => {
    test('initializes extension', async () => {
      const result = initialize();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [config.storage.keys.enabled]: config.storage.defaultState,
      });
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
      expect(chrome.action.onClicked.addListener).toHaveBeenCalled();
    });

    test('handles initialization errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      chrome.storage.local.set.mockImplementationOnce(() =>
        Promise.reject(new Error('Init error'))
      );

      const result = initialize();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});
