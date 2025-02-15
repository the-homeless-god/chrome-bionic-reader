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
      text: Node.TEXT_NODE,
      element: Node.ELEMENT_NODE
    },
    treeWalker: {
      filter: {
        accept: NodeFilter.FILTER_ACCEPT,
        reject: NodeFilter.FILTER_REJECT
      },
      type: NodeFilter.SHOW_ELEMENT
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
      prefix: 'icon',
      sizes: {
        16: '16.png',
        48: '48.png',
        128: '128.png'
      }
    },
    disabled: {
      prefix: 'icon-disabled',
      sizes: {
        16: '16.png',
        48: '48.png',
        128: '128.png'
      }
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = config;
}
