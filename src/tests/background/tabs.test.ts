import { chrome } from '../mocks/chrome';
import config from '@/config';
import { getCurrentTab, executeContentScript } from '@/background/tabs';
import * as E from 'fp-ts/Either';

type Tab = chrome.tabs.Tab;

describe('Tabs Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chrome.tabs.query.mockImplementation(() => Promise.resolve([{ id: 1 } as Tab]));
    chrome.tabs.sendMessage.mockImplementation(() => Promise.resolve());
  });

  describe('getCurrentTab', () => {
    test('returns current tab', async () => {
      const result = await getCurrentTab()();
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual({ id: 1 });
      }
      expect(chrome.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true,
      });
    });

    test('handles query error', async () => {
      const queryError = new Error('Query error');
      (chrome.tabs.query as jest.Mock).mockRejectedValueOnce(queryError);

      const result = await getCurrentTab()();
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe(`${config.errors.tabs.query}: Error: Query error`);
      }
    });

    test('handles no tab found', async () => {
      (chrome.tabs.query as jest.Mock).mockResolvedValueOnce([]);

      const result = await getCurrentTab()();
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe(config.errors.tabs.query);
      }
    });
  });

  describe('executeContentScript', () => {
    test('sends message to tab', async () => {
      const result = await executeContentScript(1)();
      expect(E.isRight(result)).toBe(true);
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, {
        type: config.messages.types.getStats
      });
    });

    test('handles execution error', async () => {
      const execError = new Error('Execute error');
      (chrome.tabs.sendMessage as jest.Mock).mockRejectedValueOnce(execError);

      const result = await executeContentScript(1)();
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe(`${config.errors.tabs.execute}: Error: Execute error`);
      }
    });
  });
});
