import { chrome } from '../mocks/chrome';
import config from '@/config';
import { executeContentScript, getCurrentTab } from '@/background/tabs';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';

const mockTab: chrome.tabs.Tab = {
  id: 1,
  index: 0,
  pinned: false,
  highlighted: false,
  windowId: 1,
  active: true,
  incognito: false,
  selected: true,
  discarded: false,
  autoDiscardable: true,
  groupId: -1,
};

describe('Tabs Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chrome.tabs.query.mockImplementation(() => Promise.resolve([mockTab]));
    chrome.scripting.executeScript.mockImplementation(() =>
      Promise.resolve([{ result: undefined }])
    );
  });

  describe('getCurrentTab', () => {
    test('returns current tab', async () => {
      const result = await pipe(
        getCurrentTab(),
        TE.fold(
          () => T.of(undefined),
          (tab) => T.of(tab)
        )
      )();

      expect(result).toEqual(mockTab);
      expect(chrome.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true,
      });
    });

    test('handles no active tab', async () => {
      chrome.tabs.query.mockImplementationOnce(() => Promise.resolve([]));

      const result = await pipe(
        getCurrentTab(),
        TE.fold(
          (error) => T.of(error.message),
          () => T.of('success')
        )
      )();

      expect(result).toBe(`${config.errors.tabs.query}: Error: ${config.errors.tabs.query}`);
    });

    test('handles query error', async () => {
      chrome.tabs.query.mockImplementationOnce(() => Promise.reject(new Error('Query error')));

      const result = await pipe(
        getCurrentTab(),
        TE.fold(
          (error) => T.of(error.message),
          () => T.of('success')
        )
      )();

      expect(result).toBe(`${config.errors.tabs.query}: Error: Query error`);
    });
  });

  describe('executeContentScript', () => {
    test('executes script in tab', async () => {
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

    test('handles execution error', async () => {
      chrome.scripting.executeScript.mockImplementationOnce(() =>
        Promise.reject(new Error('Execute error'))
      );

      const result = await pipe(
        executeContentScript(1),
        TE.fold(
          (error) => T.of(error.message),
          () => T.of('success')
        )
      )();

      expect(result).toBe(`${config.errors.tabs.execute}: Error: Execute error`);
    });
  });
});
