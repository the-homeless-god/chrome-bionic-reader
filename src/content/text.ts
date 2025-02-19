import config from '@/config';
import { TextPart, Settings } from '@/types';
import { pipe } from 'fp-ts/function';
import { getSettings } from '@/services/settings';
import { log } from '@/services/logger';

let userSettings: Settings = config.storage.defaultSettings;

// Load settings on initialization
getSettings()().then(
  (settings) => {
    if ('right' in settings) {
      userSettings = settings.right;
      log.debug('User settings loaded', userSettings);
    }
  }
);

export const isEmptyWord = (word: string): boolean => word === config.constants.emptyString;

export const isRussianLanguage = (language: string): boolean =>
  language === config.languages.ru.code;

export const detectLanguage = (word: string): string => {
  if (config.languages.ru.detector.test(word)) return config.languages.ru.code;
  if (config.languages.en.detector.test(word)) return config.languages.en.code;
  return config.defaultLanguage;
};

export const calculateBoldLength = (word: string, language: string): number => {
  if (isEmptyWord(word)) return config.constants.zero;

  const langConfig = language === config.languages.ru.code
    ? config.languages.ru
    : config.languages.en;

  // Use user settings if available
  const userBoldLength = userSettings[language]?.boldLength;
  const baseBoldLength = userBoldLength || langConfig.boldLength;

  // For long words, use percentage-based calculation
  if (word.length > config.constants.longWordThreshold) {
    const percentLength = Math.ceil(word.length * config.constants.boldPercentage);
    const minLength = Math.max(
      Math.ceil(word.length * config.constants.minBoldPercentage),
      langConfig.minBoldLength
    );
    const maxLength = Math.min(
      Math.ceil(word.length * config.constants.maxBoldPercentage),
      langConfig.maxBoldLength
    );
    return Math.min(Math.max(percentLength, minLength), maxLength);
  }

  // For short words, use fixed length but ensure it's not longer than the word
  return Math.min(
    baseBoldLength,
    word.length,
    langConfig.maxBoldLength
  );
};

export const splitIntoWords = (text: string): string[] => {
  // Сохраняем пробелы и специальные символы
  return text.split(/(\s+)/).filter(Boolean);
};

export const createBoldTag = (text: string): string =>
  `<${config.dom.boldTag}>${text}</${config.dom.boldTag}>`;

export const joinWithBold = (parts: TextPart): string => parts.start + createBoldTag(parts.end);

export const removeBoldTags = (text: string): string =>
  text.replace(config.dom.regex.boldTags, config.constants.emptyString);

export const processWord = (word: string): string => {
  if (isEmptyWord(word)) return word;

  const language = detectLanguage(word);
  const boldLength = calculateBoldLength(word, language);

  return pipe(
    {
      start: word.slice(0, boldLength),
      end: word.slice(boldLength),
    },
    (parts) => createBoldTag(parts.start) + parts.end
  );
};

export const processText = (text: string): string => {
  return pipe(
    text,
    splitIntoWords,
    (words) => words.map(word => {
      // Пропускаем обработку для пробельных символов
      if (/^\s+$/.test(word)) return ' '; // Нормализуем пробелы
      return processWord(word);
    }),
    (words) => words.join('')  // Соединяем без дополнительных пробелов
  );
};
