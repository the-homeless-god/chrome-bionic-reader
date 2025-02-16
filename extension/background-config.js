export default {
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
  storage: {
    keys: {
      enabled: 'isEnabled'
    },
    defaultState: false
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
