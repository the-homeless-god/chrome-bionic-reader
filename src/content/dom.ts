import config from '@/config';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';

export const markAsProcessed = (element: Element): Element => {
  config.state.processedElements.add(element);
  return element;
};

export const isTextNode = (node: Node): boolean => node.nodeType === config.dom.nodeTypes.text;

export const hasParentWithTag = (element: Element, tags: string[]): boolean =>
  pipe(
    O.fromNullable(element.parentElement),
    O.fold(
      () => false,
      (parent) => tags.includes(parent.tagName.toLowerCase()) || hasParentWithTag(parent, tags)
    )
  );

export const isValidElement = (element: Element): boolean =>
  pipe(
    element.tagName.toLowerCase(),
    (tagName) =>
      !config.dom.excludedTags.includes(tagName) &&
      !hasParentWithTag(element, config.dom.excludedTags) &&
      !config.state.processedElements.has(element)
  );

export const createTreeWalker = (root: Element): TreeWalker =>
  document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

export const removeFormattingFromElements = (elements: NodeListOf<Element>): void => {
  Array.from(elements).forEach((element) => {
    pipe(
      O.fromNullable(element.parentNode),
      O.map((parent) => {
        parent.textContent = pipe(parent.textContent || config.constants.emptyString, (text) =>
          text.replace(config.dom.regex.boldTags, config.constants.emptyString)
        );
        return parent;
      })
    );
  });
};
