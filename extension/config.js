const config = {
  languages: {
    ru: {
      pattern: /[а-яА-ЯёЁ]/,
      boldLength: 3,
    },
    en: {
      pattern: /[a-zA-Z]/,
      boldLength: 2,
    },
  },
  defaultLanguage: 'en',
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
      paths: {
        16: 'icons/button/smartReader-16.png',
        32: 'icons/button/smartReader-32.png',
        48: 'icons/smartReader-48.png',
        128: 'icons/smartReader-128.png'
      }
    },
    disabled: {
      paths: {
        16: 'icons/button/smartReader-disabled-16.png',
        32: 'icons/button/smartReader-disabled-32.png',
        48: 'icons/smartReader-48.png',
        128: 'icons/smartReader-128.png'
      }
    }
  }
};

export default config;
