import config from '@/config';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { processText } from './text';
import { markAsProcessed } from './dom';

const preserveWhitespace = (element: Element, processedText: string): string => {
  // Сохраняем начальные и конечные пробелы
  const originalText = element.textContent || '';
  const startSpace = originalText.match(/^\s+/)?.[0] || '';
  const endSpace = originalText.match(/\s+$/)?.[0] || '';
  return startSpace + processedText.trim() + endSpace;
};

export const processElement = (element: Element): Element =>
  pipe(
    O.fromNullable(element.textContent),
    O.filter((text) => text.trim().length > 0),
    O.map((text) => processText(text)),
    O.filter((processedText) => processedText !== element.textContent),
    O.map((processedText) => {
      const preservedText = preserveWhitespace(element, processedText);
      element.innerHTML = preservedText;
      return markAsProcessed(element);
    }),
    O.getOrElse(() => element)
  );

export const processNode = (node: Node): void => {
  pipe(
    O.fromNullable(node),
    O.filter((n) => n.nodeType === config.dom.nodeTypes.text),
    O.chain((n) => O.fromNullable(n.parentElement)),
    O.filter((element) => !config.dom.excludedTags.includes(element.tagName.toLowerCase())),
    O.map(processElement)
  );
};
