import { initializeStorage } from '@/background/storage';
import { handleMessage } from '@/background/messaging';
import { initialize } from '@/background';
import { chrome } from './mocks/chrome';
import config from '@/config';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';

type StorageCallback = (items: { [key: string]: any }) => void;

describe('Extension Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-expect-error - Мокаем chrome API
    chrome.storage.local.get.mockImplementation((keys: string[], callback?: StorageCallback) => {
      const result = { [config.storage.keys.enabled]: true };
      if (callback) {
        callback(result);
      }
      return Promise.resolve(result);
    });

    chrome.storage.local.set.mockImplementation(() => Promise.resolve());
  });

  test('initializes storage with default state', async () => {
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

  test.skip('handles getState message', async () => {
    const sendResponse = jest.fn();
    const result = handleMessage(
      { type: config.messages.types.getState },
      {},
      sendResponse
    );

    expect(result).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(chrome.storage.local.get).toHaveBeenCalledWith(
      [config.storage.keys.enabled],
      expect.any(Function)
    );
  });

  test('ignores unknown message types', async () => {
    const sendResponse = jest.fn();
    const result = handleMessage(
      { type: 'unknown' as any },
      {},
      sendResponse
    );

    expect(result).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(chrome.storage.local.get).not.toHaveBeenCalled();
    expect(sendResponse).not.toHaveBeenCalled();
  });

  test('initializes extension', async () => {
    const result = initialize();
    expect(result).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      [config.storage.keys.enabled]: config.storage.defaultState,
    });
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    expect(chrome.action.onClicked.addListener).toHaveBeenCalled();
  });

  test('pipe function works correctly', () => {
    const add = (x: number): number => x + 1;
    const multiply = (x: number): number => x * 2;

    const result = pipe(1, add, multiply);
    expect(result).toBe(4);
  });

  test('initializes extension automatically', async () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../background');
    });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(chrome.storage.local.set).toHaveBeenCalled();
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
  });
});
