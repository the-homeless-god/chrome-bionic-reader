import { chrome, createMockStorageWithCallback } from '../mocks/chrome';
import config from '@/config';
import { updateStorage, getStorageState, initializeStorage } from '@/background/storage';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';

describe('Storage Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    chrome.storage.local.get.mockImplementation(createMockStorageWithCallback(true));
    chrome.storage.local.set.mockImplementation(() => Promise.resolve());
  });

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

  test('handles storage errors', async () => {
    const error = new Error('Storage error');
    chrome.storage.local.get.mockImplementationOnce(() => Promise.reject(error));

    const result = await pipe(
      getStorageState(),
      TE.fold(
        (e) => T.of(e.message),
        () => T.of('success')
      )
    )();

    expect(result).toBe(`${config.errors.storage.get}: ${error.message}`);
  }, 15000);
});
