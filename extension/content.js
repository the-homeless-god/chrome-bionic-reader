const config = require('./config');
const { pipe } = require('./utils');

const getFirstChar = word => word?.[config.constants.firstChar];

const detectLanguage = char => 
  Object.entries(config.languages)
    .find(([_, { pattern }]) => pattern.test(char))
    ?.[config.constants.firstChild] || config.defaultLanguage;

const getLanguageBoldLength = word => {
  const firstChar = getFirstChar(word);
  if (!firstChar) return config.defaultBoldLength;
  
  const language = detectLanguage(firstChar);
  return config.languages[language]?.boldLength || config.defaultBoldLength;
};

const getBoldLength = pipe(
  getLanguageBoldLength
);

const splitIntoWords = text => 
  text?.split(config.dom.wordSeparator) || [];

const isTextNode = node => 
  node.nodeType === config.dom.nodeTypes.text;

const isValidElement = node =>
  node.nodeType === config.dom.nodeTypes.element &&
  !config.excludedTags.includes(node.tagName);

const hasSingleTextChild = element =>
  element.childNodes.length === config.constants.singleChild && 
  isTextNode(element.firstChild);

const removeBoldTags = text => 
  text.replace(new RegExp(`<\\/?${config.dom.boldTag}>`, 'g'), config.constants.emptyString);

const calculateBoldLength = (word, boldLength) =>
  Math.min(boldLength, Math.ceil(word.length / 2));

const wrapInBold = (text, length) => ({
  start: text.slice(config.constants.firstChild, length),
  end: text.slice(length)
});

const joinWithBold = ({ start, end }) =>
  start.length ? `<${config.dom.boldTag}>${start}</${config.dom.boldTag}>${end}` : end;

const modifyWord = word => {
  const trimmed = word.trim();
  if (!trimmed) return word;
  
  const boldLength = getBoldLength(trimmed);
  const actualLength = calculateBoldLength(trimmed, boldLength);
  
  return pipe(
    text => wrapInBold(text, actualLength),
    joinWithBold
  )(trimmed);
};

const modifyText = pipe(
  splitIntoWords,
  words => words.map(modifyWord),
  words => words.join('')
);

const createElementInfo = element => ({
  node: element,
  text: element.textContent
});

const filterValidElements = elements =>
  Array.from(elements).filter(hasSingleTextChild);

const updateElement = element => {
  const originalText = removeBoldTags(element.textContent);
  const modifiedText = modifyText(originalText);
  
  if (modifiedText !== element.textContent) {
    element.innerHTML = modifiedText;
  }
  
  return element;
};

const createTreeWalker = () =>
  document.createTreeWalker(
    document.body,
    config.dom.treeWalker.type,
    {
      acceptNode: node => 
        isValidElement(node)
          ? config.dom.treeWalker.filter.accept
          : config.dom.treeWalker.filter.reject
    }
  );

const collectElements = walker => {
  const elements = [];
  let node;
  
  while (node = walker.nextNode()) {
    elements.push(node);
  }
  
  return elements;
};

const updatePage = () =>
  pipe(
    createTreeWalker,
    collectElements,
    filterValidElements,
    elements => elements.map(updateElement)
  )();

const initializeExtension = () =>
  chrome.storage.local.get([config.storage.keys.enabled], result => {
    if (result[config.storage.keys.enabled]) updatePage();
  });

const createObserver = () => {
  const observer = new MutationObserver(() =>
    chrome.storage.local.get([config.storage.keys.enabled], result => {
      if (result[config.storage.keys.enabled]) updatePage();
    })
  );

  observer.observe(document.body, config.dom.observer.config);
  return observer;
};

// Initialize
initializeExtension();
createObserver();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectLanguage,
    getBoldLength,
    splitIntoWords,
    isTextNode,
    isValidElement,
    hasSingleTextChild,
    removeBoldTags,
    calculateBoldLength,
    wrapInBold,
    joinWithBold,
    modifyWord,
    modifyText,
    createElementInfo,
    filterValidElements,
    updateElement,
    createTreeWalker,
    collectElements,
    updatePage,
    initializeExtension,
    createObserver
  };
}
