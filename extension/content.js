// Функция дебаунса для оптимизации производительности
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const getFirstChar = word => word?.[window.config.constants.firstChar];

const detectLanguage = char => 
  Object.entries(window.config.languages)
    .find(([_, { pattern }]) => pattern.test(char))
    ?.[window.config.constants.firstChild] || window.config.defaultLanguage;

const getLanguageBoldLength = word => {
  const firstChar = getFirstChar(word);
  if (!firstChar) return window.config.defaultBoldLength;
  
  const language = detectLanguage(firstChar);
  return window.config.languages[language]?.boldLength || window.config.defaultBoldLength;
};

const getBoldLength = window.utils.pipe(
  getLanguageBoldLength
);

const splitIntoWords = text => 
  text?.split(window.config.dom.wordSeparator) || [];

const isTextNode = node => 
  node.nodeType === window.config.dom.nodeTypes.text;

const isValidElement = node =>
  node.nodeType === window.config.dom.nodeTypes.element &&
  !window.config.excludedTags.includes(node.tagName);

const hasSingleTextChild = element =>
  element.childNodes.length === window.config.constants.singleChild && 
  isTextNode(element.firstChild);

const removeBoldTags = text => 
  text.replace(new RegExp(`<\\/?${window.config.dom.boldTag}>`, 'g'), window.config.constants.emptyString);

const calculateBoldLength = (word, boldLength) =>
  Math.min(boldLength, Math.ceil(word.length / 2));

const wrapInBold = (text, length) => ({
  start: text.slice(window.config.constants.firstChild, length),
  end: text.slice(length)
});

const joinWithBold = ({ start, end }) =>
  start.length ? `<${window.config.dom.boldTag}>${start}</${window.config.dom.boldTag}>${end}` : end;

const modifyWord = word => {
  if (!word || word.trim() === '') return '';
  const boldLength = getBoldLength(word);
  return window.utils.pipe(
    text => wrapInBold(text, boldLength),
    joinWithBold
  )(word);
};

const modifyText = text => 
  window.utils.pipe(
    splitIntoWords,
    words => words.map(word => modifyWord(word)),
    parts => parts.join(window.config.constants.emptyString)
  )(text);

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
    window.config.dom.treeWalker.type,
    {
      acceptNode: node => 
        isValidElement(node)
          ? window.config.dom.treeWalker.filter.accept
          : window.config.dom.treeWalker.filter.reject
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

const updateStats = (processedCount, processingTime) => {
  chrome.storage.local.get([window.config.storage.keys.stats], result => {
    const currentStats = result[window.config.storage.keys.stats] || window.config.storage.defaultStats;
    const newStats = {
      totalProcessed: currentStats.totalProcessed + processedCount,
      lastProcessingTime: processingTime,
      averageProcessingTime: (currentStats.averageProcessingTime * currentStats.totalProcessed + processingTime) / (currentStats.totalProcessed + 1)
    };
    chrome.storage.local.set({ [window.config.storage.keys.stats]: newStats });
  });
};

const updatePage = () => {
  const startTime = performance.now();
  const result = window.utils.pipe(
    createTreeWalker,
    collectElements,
    filterValidElements,
    elements => {
      const processedElements = elements.map(updateElement);
      const processedCount = processedElements.length;
      const processingTime = performance.now() - startTime;
      
      if (processingTime < window.config.performance.processingTimeThreshold) {
        updateStats(processedCount, processingTime);
      }
      
      return processedElements;
    }
  )();
  return result;
};

// Дебаунсированная версия updatePage
const debouncedUpdatePage = debounce(updatePage, 100);

const initializeExtension = () => {
  // Проверяем состояние страницы
  if (document.readyState === 'loading') {
    // Если страница загружается, ждем завершения загрузки
    document.addEventListener('DOMContentLoaded', () => {
      chrome.storage.local.get([window.config.storage.keys.enabled], result => {
        if (result[window.config.storage.keys.enabled]) debouncedUpdatePage();
      });
    });
  } else {
    // Если страница уже загружена, обрабатываем сразу
    chrome.storage.local.get([window.config.storage.keys.enabled], result => {
      if (result[window.config.storage.keys.enabled]) debouncedUpdatePage();
    });
  }
};

const createObserver = () => {
  const observer = new MutationObserver(() =>
    chrome.storage.local.get([window.config.storage.keys.enabled], result => {
      if (result[window.config.storage.keys.enabled]) debouncedUpdatePage();
    })
  );

  // Ждем полной загрузки страницы перед началом наблюдения
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, window.config.dom.observer.config);
    });
  } else {
    observer.observe(document.body, window.config.dom.observer.config);
  }

  return observer;
};

// Initialize
initializeExtension();
createObserver();

// Для тестов
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
