type Language = {
  pattern: RegExp;
  boldLength: number;
  detector: RegExp;
  code: string;
  minBoldLength: number;
  maxBoldLength: number;
};

type Languages = {
  [key: string]: Language;
};

type Constants = {
  singleChild: number;
  firstChild: number;
  firstChar: number;
  emptyString: string;
  space: string;
  half: number;
  longWordThreshold: number;
  boldPercentage: number;
  minBoldPercentage: number;
  maxBoldPercentage: number;
  punctuation: {
    comma: string;
  };
  zero: number;
  hundred: number;
  thousand: number;
};

export type Stats = {
  totalProcessed: number;
  lastProcessingTime: number;
  averageProcessingTime: number;
  sessionStartTime: number;
};

export type LanguageSettings = {
  boldLength: number;
};

export type Settings = {
  [key: string]: LanguageSettings;
};

type DOMSelectors = {
  boldElements: string;
  textElements: string;
  resetButton: string;
  reprocessButton: string;
  processedWords: string;
  averageTime: string;
  sessionInfo: string;
  inputs: {
    ruLength: string;
    enLength: string;
  };
};

export interface Config {
  languages: Languages;
  defaultLanguage: string;
  defaultBoldLength: number;
  constants: Constants;
  state: {
    processedElements: WeakSet<Element>;
    observer: MutationObserver | null;
  };
  processing: {
    maxRecursionDepth: number;
    batchSize: number;
  };
  dom: {
    boldTag: string;
    wordSeparator: RegExp;
    nodeTypes: {
      text: number;
      element: number;
    };
    excludedTags: string[];
    treeWalker: {
      filter: {
        accept: number;
        reject: number;
        skip: number;
      };
      type: number;
    };
    observer: {
      config: {
        childList: boolean;
        subtree: boolean;
        characterData: boolean;
      };
    };
    selectors: DOMSelectors;
    regex: {
      boldTags: RegExp;
    };
  };
  storage: {
    keys: {
      enabled: string;
      stats: string;
      settings: string;
    };
    defaultState: boolean;
    defaultStats: Stats;
    defaultSettings: Settings;
  };
  icons: {
    enabled: {
      paths: {
        [key: string]: string;
      };
    };
    disabled: {
      paths: {
        [key: string]: string;
      };
    };
  };
  performance: {
    debounceTime: number;
    processingTimeThreshold: number;
  };
  time: {
    hour: number;
    minute: number;
    formats: {
      hourMinute: string;
    };
  };
  messages: {
    types: {
      updateStats: MessageType;
      resetStats: MessageType;
      getStats: MessageType;
      statsUpdated: MessageType;
      getState: MessageType;
    };
  };
  errors: {
    storage: {
      get: string;
      set: string;
    };
    tabs: {
      query: string;
      execute: string;
    };
    stats: {
      update: string;
      reset: string;
    };
    icon: {
      update: string;
    };
  };
  debug: {
    enabled: boolean;
    prefix: string;
  };
}

export type MessageType = 'updateStats' | 'resetStats' | 'getStats' | 'statsUpdated' | 'getState';

export type Message = {
  type: MessageType;
  data?: Stats;
};

export type TextPart = {
  start: string;
  end: string;
};

// Extending global Window interface
declare global {
  interface Window {
    updatePage?: () => Promise<void>;
    resetState?: () => void;
    config?: Config;
  }
}
