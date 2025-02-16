const config = {
  languages: {
    russian: {
      pattern: /[а-яА-ЯёЁ]/,
      boldLength: 3,
    },
    english: {
      pattern: /[a-zA-Z]/,
      boldLength: 2,
    },
  },
  defaultLanguage: 'english',
  defaultBoldLength: 2,
  constants: {
    singleChild: 1,
    firstChild: 0,
    firstChar: 0,
    emptyString: '',
  },
  excludedTags: [
    "SCRIPT",
    "STYLE",
    "PRE",
    "CODE",
    "TEXTAREA",
    "INPUT",
    "SELECT",
    "OPTION",
    "BUTTON",
    "IMG",
    "SVG",
    "CANVAS",
    "MATH",
    "NOSCRIPT",
    "TEMPLATE",
  ],
  storage: {
    keys: {
      enabled: 'isEnabled'
    },
    defaultState: false
  },
  dom: {
    boldTag: 'b',
    wordSeparator: /(\s+)/,
    nodeTypes: {
      text: 3,
      element: 1
    },
    treeWalker: {
      filter: {
        accept: 1,
        reject: 2
      },
      type: 1
    },
    observer: {
      config: {
        childList: true,
        subtree: true
      }
    }
  },
  icons: {
    enabled: {
      prefix: 'button/smartReader-',
      sizes: {
        16: '16.png',
        32: '32.png',
        48: '../smartReader-48.png',
        128: '../smartReader-128.png'
      }
    },
    disabled: {
      prefix: 'button/smartReader-disabled-',
      sizes: {
        16: '16.png',
        32: '32.png',
        48: '../smartReader-48.png',
        128: '../smartReader-128.png'
      }
    }
  }
};

export default config;
