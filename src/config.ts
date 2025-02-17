import { Config, Stats } from '@/types';

const defaultStats: Stats = {
  totalProcessed: 0,
  lastProcessingTime: 0,
  averageProcessingTime: 0,
  sessionStartTime: Date.now(),
};

const config: Config = {
  languages: {
    ru: {
      pattern: /[а-яё]/i,
      boldLength: 2,
      detector: /[а-яА-ЯёЁ]/,
      code: 'ru',
    },
    en: {
      pattern: /[a-z]/i,
      boldLength: 1,
      detector: /[a-zA-Z]/,
      code: 'en',
    },
  },
  defaultLanguage: 'en',
  defaultBoldLength: 1,
  constants: {
    singleChild: 1,
    firstChild: 0,
    firstChar: 0,
    emptyString: '',
    space: ' ',
    half: 2,
  },
  dom: {
    boldTag: 'b',
    wordSeparator: /\s+/,
    nodeTypes: {
      text: Node.TEXT_NODE,
      element: Node.ELEMENT_NODE,
    },
    excludedTags: ['script', 'style', 'noscript', 'iframe', 'b'],
    treeWalker: {
      filter: {
        accept: NodeFilter.FILTER_ACCEPT,
        reject: NodeFilter.FILTER_REJECT,
        skip: NodeFilter.FILTER_SKIP,
      },
      type: NodeFilter.SHOW_TEXT,
    },
    observer: {
      config: {
        childList: true,
        subtree: true,
        characterData: true,
      },
    },
    selectors: {
      boldElements: 'b',
      textElements: 'p, h1, h2, h3, h4, h5, h6, span, div',
      resetButton: 'resetButton',
      processedWords: 'processedWords',
      averageTime: 'averageTime',
      sessionInfo: 'sessionInfo',
    },
    regex: {
      boldTags: /<\/?b>/g,
    },
  },
  storage: {
    keys: {
      enabled: 'enabled',
      stats: 'stats',
    },
    defaultState: true,
    defaultStats,
  },
  icons: {
    enabled: {
      paths: {
        '16': 'icons/button/smartReader-16.png',
        '32': 'icons/button/smartReader-32.png',
        '48': 'icons/smartReader-48.png',
        '128': 'icons/smartReader-128.png',
      },
    },
    disabled: {
      paths: {
        '16': 'icons/button/smartReader-disabled-16.png',
        '32': 'icons/button/smartReader-disabled-32.png',
        '48': 'icons/smartReader-disabled-48.png',
        '128': 'icons/smartReader-disabled-128.png',
      },
    },
  },
  performance: {
    debounceTime: 250,
    processingTimeThreshold: 1000,
  },
  time: {
    hour: 3600000,
    minute: 60000,
    formats: {
      hourMinute: '%hh %mm',
    },
  },
  state: {
    processedElements: new WeakSet<Element>(),
    observer: null as MutationObserver | null,
  },
  processing: {
    maxRecursionDepth: 100,
    batchSize: 50,
  },
  messages: {
    types: {
      updateStats: 'updateStats',
      resetStats: 'resetStats',
      getStats: 'getStats',
      statsUpdated: 'statsUpdated',
      getState: 'getState',
    },
  },
  errors: {
    storage: {
      get: 'Failed to get storage state',
      set: 'Failed to set storage state',
    },
    tabs: {
      query: 'Failed to query tabs',
      execute: 'Failed to execute content script',
    },
    stats: {
      update: 'Failed to update stats',
      reset: 'Failed to reset stats',
    },
    icon: {
      update: 'Failed to update icon',
    },
  },
} as const;

export default config;
