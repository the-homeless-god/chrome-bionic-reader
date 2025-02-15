# Chrome Bionic Reader

Chrome Bionic Reader is a Chrome extension that helps improve reading focus by highlighting the beginning of words in bold (bionic reading principle).

## Differences from the original [smartReader](https://github.com/Poucous/smartReader):

- Functional Programming style
- Clean Architecture
- Configuration-driven development
- Russian language support
- Automatic publishing to Chrome Web Store
- 100% test coverage
- Continuous functionality through automated testing

## Architecture

The extension follows functional programming principles:
- Pure functions
- Immutability
- Function composition
- Declarative style
- Configuration-driven development

```javascript
// Function composition example
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

// Pure function example
const detectLanguage = char => 
  Object.entries(config.languages)
    .find(([_, { pattern }]) => pattern.test(char))
    ?.[0] || config.defaultLanguage;

// Declarative style example
const updatePage = () =>
  pipe(
    createTreeWalker,
    collectElements,
    filterValidElements,
    elements => elements.map(updateElement)
  )();
```

## Installation

### From Chrome Web Store
Install the extension directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/chrome-bionic-reader/)

### Manual Installation
1. Clone the repository:
```bash
git clone https://github.com/the-homeless-god/chrome-bionic-reader
cd chrome-bionic-reader
```

### Chrome Installation

1. Open the extensions page in chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the extension folder from the downloaded repository

## Development

```bash
# Install dependencies
cd tests
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Generate coverage badges
npm run test:badges
```

## Configuration

All configuration is centralized in `extension/config.js`:

```javascript
{
  languages: {
    russian: {
      pattern: /[а-яА-ЯёЁ]/,
      boldLength: 3
    },
    english: {
      pattern: /[a-zA-Z]/,
      boldLength: 2
    }
  },
  // ... other configuration
}
```

To add a new language:

1. Add language configuration to `config.js`:
```javascript
japanese: {
  pattern: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,
  boldLength: 1
}
```

## Publishing

The extension is automatically published to Chrome Web Store when:
1. All tests pass
2. Coverage thresholds are met
3. A new tag is created

Required secrets:
- `EXTENSION_ID`
- `CLIENT_ID`
- `CLIENT_SECRET`
- `REFRESH_TOKEN`

## Test Coverage

- 100% functional coverage
- Pure function testing
- Integration tests
- DOM manipulation tests
- Chrome API mocking

## For Firefox

For Firefox, it is recommended to use the [original extension](https://github.com/Poucous/smartReader).

## Contact

Email: zimtir@mail.ru 
