import config from '@/config';
import { TextPart } from '@/types';
import { pipe } from 'fp-ts/function';

export const isEmptyWord = (word: string): boolean => word === config.constants.emptyString;

export const isRussianLanguage = (language: string): boolean =>
  language === config.languages.ru.code;

export const detectLanguage = (word: string): string => {
  if (config.languages.ru.detector.test(word)) return config.languages.ru.code;
  if (config.languages.en.detector.test(word)) return config.languages.en.code;
  return config.defaultLanguage;
};

export const calculateBoldLength = (word: string, language: string): number => {
  if (isEmptyWord(word)) return 0;
  const boldLength = isRussianLanguage(language)
    ? config.languages.ru.boldLength
    : config.languages.en.boldLength;
  return Math.min(boldLength, Math.ceil(word.length / config.constants.half));
};

export const splitIntoWords = (text: string): string[] => text.split(config.dom.wordSeparator);

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
      start: word.slice(config.constants.firstChar, boldLength),
      end: word.slice(boldLength),
    },
    joinWithBold
  );
};

export const processText = (text: string): string => {
  return pipe(
    text,
    splitIntoWords,
    (words) => words.map(processWord),
    (words) => words.join(config.constants.space)
  );
};
