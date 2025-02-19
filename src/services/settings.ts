import config from '@/config';
import { Settings } from '@/types';
import * as TE from 'fp-ts/TaskEither';
import { log } from './logger';

export const getSettings = (): TE.TaskEither<Error, Settings> =>
  TE.tryCatch(
    async () => {
      const result = await chrome.storage.local.get([config.storage.keys.settings]);
      return result[config.storage.keys.settings] || config.storage.defaultSettings;
    },
    (error) => new Error(`${config.errors.storage.get}: ${error}`)
  );

export const updateSettings = (settings: Settings): TE.TaskEither<Error, void> =>
  TE.tryCatch(
    async () => {
      await chrome.storage.local.set({
        [config.storage.keys.settings]: settings,
      });
      log.info('Settings updated', settings);
    },
    (error) => new Error(`${config.errors.storage.set}: ${error}`)
  );

export const updateLanguageSettings = (
  language: string,
  boldLength: number
): TE.TaskEither<Error, void> =>
  TE.tryCatch(
    async () => {
      const settingsResult = await getSettings()();
      if ('right' in settingsResult) {
        const currentSettings = settingsResult.right;
        const newSettings = {
          ...currentSettings,
          [language]: { boldLength },
        };
        await updateSettings(newSettings)();
        log.info('Language settings updated', { language, boldLength });
      }
    },
    (error) => new Error(`${config.errors.storage.set}: ${error}`)
  ); 
