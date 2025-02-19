import { chrome } from '../mocks/chrome';
import config from '@/config';
import { getSettings, updateSettings, updateLanguageSettings } from '@/services/settings';
import * as E from 'fp-ts/Either';

describe('Settings Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    test('returns default settings when no settings in storage', async () => {
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [config.storage.keys.settings]: null })
      );

      const result = await getSettings()();
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(config.storage.defaultSettings);
      }
    });

    test('returns stored settings when available', async () => {
      const mockSettings = {
        ru: { boldLength: 4 },
        en: { boldLength: 3 }
      };
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [config.storage.keys.settings]: mockSettings })
      );

      const result = await getSettings()();
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(mockSettings);
      }
    });

    test('handles storage error', async () => {
      const error = new Error('Storage error');
      chrome.storage.local.get.mockRejectedValueOnce(error);

      const result = await getSettings()();
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe(`${config.errors.storage.get}: Error: Storage error`);
      }
    });
  });

  describe('updateSettings', () => {
    test('updates settings in storage', async () => {
      const newSettings = {
        ru: { boldLength: 4 },
        en: { boldLength: 3 }
      };

      const result = await updateSettings(newSettings)();
      expect(E.isRight(result)).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [config.storage.keys.settings]: newSettings
      });
    });

    test('handles storage error', async () => {
      const error = new Error('Storage error');
      chrome.storage.local.set.mockRejectedValueOnce(error);

      const newSettings = {
        ru: { boldLength: 4 },
        en: { boldLength: 3 }
      };

      const result = await updateSettings(newSettings)();
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe(`${config.errors.storage.set}: Error: Storage error`);
      }
    });
  });

  describe('updateLanguageSettings', () => {
    test('updates settings for specific language', async () => {
      const currentSettings = {
        ru: { boldLength: 3 },
        en: { boldLength: 2 }
      };
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [config.storage.keys.settings]: currentSettings })
      );

      const result = await updateLanguageSettings('ru', 4)();
      expect(E.isRight(result)).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [config.storage.keys.settings]: {
          ...currentSettings,
          ru: { boldLength: 4 }
        }
      });
    });

    test('handles storage error during get', async () => {
      const error = new Error('Storage error');
      chrome.storage.local.get.mockRejectedValueOnce(error);

      const result = await updateLanguageSettings('ru', 4)();
      expect(E.isLeft(result)).toBe(false);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe(`${config.errors.storage.set}: Error: Storage error`);
      }
    });

    test('handles storage error during set', async () => {
      const currentSettings = {
        ru: { boldLength: 3 },
        en: { boldLength: 2 }
      };
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [config.storage.keys.settings]: currentSettings })
      );
      const error = new Error('Storage error');
      chrome.storage.local.set.mockRejectedValueOnce(error);

      const result = await updateLanguageSettings('ru', 4)();
      expect(E.isLeft(result)).toBe(false);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe(`${config.errors.storage.set}: Error: Storage error`);
      }
    });
  });
}); 
