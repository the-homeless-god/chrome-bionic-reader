type Language = {
  pattern: RegExp;
  boldLength: number;
  detector: RegExp;
  code: string;
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
};

export type Stats = {
  totalProcessed: number;
  lastProcessingTime: number;
  averageProcessingTime: number;
  sessionStartTime: number;
};

export type Config = {
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
    selectors: {
      boldElements: string;
      textElements: string;
      resetButton: string;
      processedWords: string;
      averageTime: string;
      sessionInfo: string;
    };
    regex: {
      boldTags: RegExp;
    };
  };
  storage: {
    keys: {
      enabled: string;
      stats: string;
    };
    defaultState: boolean;
    defaultStats: Stats;
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
};

export type MessageType = 'updateStats' | 'resetStats' | 'getStats' | 'statsUpdated' | 'getState';

export type Message = {
  type: MessageType;
  data?: Stats;
};

export type TextPart = {
  start: string;
  end: string;
};
