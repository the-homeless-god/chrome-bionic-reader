require('./mocks/chrome');
const config = require('../extension/config');

const {
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
  updateElement,
  updatePage,
  createTreeWalker,
  createElementInfo
} = require('../extension/content.js');

describe('Language Detection', () => {
  test('detects English characters', () => {
    expect(detectLanguage('a')).toBe('english');
    expect(detectLanguage('Z')).toBe('english');
  });

  test('detects Russian characters', () => {
    expect(detectLanguage('а')).toBe('russian');
    expect(detectLanguage('Я')).toBe('russian');
    expect(detectLanguage('ё')).toBe('russian');
  });

  test('defaults to English for unknown characters', () => {
    expect(detectLanguage('1')).toBe('english');
    expect(detectLanguage(' ')).toBe('english');
    expect(detectLanguage('!')).toBe('english');
  });
});

describe('Text Processing', () => {
  test('splits text into words', () => {
    expect(splitIntoWords('Hello World')).toEqual(['Hello', ' ', 'World']);
  });

  test('removes bold tags', () => {
    expect(removeBoldTags('Hello <b>World</b>')).toBe('Hello World');
    expect(removeBoldTags('<b>Multiple</b> <b>Tags</b>')).toBe('Multiple Tags');
  });

  test('calculates bold length', () => {
    expect(calculateBoldLength('Hello', 2)).toBe(2);
    expect(calculateBoldLength('Hi', 2)).toBe(1);
  });

  test('gets bold length for different languages and edge cases', () => {
    expect(getBoldLength('test')).toBe(config.languages.english.boldLength);
    expect(getBoldLength('тест')).toBe(config.languages.russian.boldLength);
    
    // Тест для языка без boldLength
    const originalEnBoldLength = config.languages.english.boldLength;
    delete config.languages.english.boldLength;
    expect(getBoldLength('test')).toBe(config.defaultBoldLength);
    config.languages.english.boldLength = originalEnBoldLength;

    // Тест для undefined firstChar
    expect(getBoldLength(undefined)).toBe(config.defaultBoldLength);
    expect(getBoldLength(null)).toBe(config.defaultBoldLength);
    expect(getBoldLength('')).toBe(config.defaultBoldLength);
  });

  test('wraps text in bold', () => {
    expect(wrapInBold('Hello', 2)).toEqual({
      start: 'He',
      end: 'llo'
    });
  });

  test('joins text with bold tags', () => {
    expect(joinWithBold({ start: 'He', end: 'llo' })).toBe('<b>He</b>llo');
    expect(joinWithBold({ start: '', end: 'test' })).toBe('test');
  });
});

describe('Word Modification', () => {
  test('handles empty and whitespace', () => {
    expect(modifyWord('')).toBe('');
    expect(modifyWord(' ')).toBe(' ');
  });

  test('modifies English words', () => {
    expect(modifyWord('Hello')).toBe('<b>He</b>llo');
    expect(modifyWord('World')).toBe('<b>Wo</b>rld');
  });

  test('modifies Russian words', () => {
    expect(modifyWord('Привет')).toBe('<b>При</b>вет');
    expect(modifyWord('Мир')).toBe('<b>Ми</b>р');
  });
});

describe('Text Modification', () => {
  test('handles empty input', () => {
    expect(modifyText('')).toBe('');
    expect(modifyText(null)).toBe('');
    expect(modifyText(undefined)).toBe('');
  });

  test('modifies complete sentences', () => {
    expect(modifyText('Hello World')).toBe('<b>He</b>llo <b>Wo</b>rld');
    expect(modifyText('Привет Мир')).toBe('<b>При</b>вет <b>Ми</b>р');
  });
});

describe('DOM Operations', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('identifies text nodes', () => {
    const textNode = document.createTextNode('test');
    expect(isTextNode(textNode)).toBe(true);
    expect(isTextNode(document.createElement('div'))).toBe(false);
  });

  test('validates elements', () => {
    expect(isValidElement(document.createElement('div'))).toBe(true);
    expect(isValidElement(document.createElement('script'))).toBe(false);
  });

  test('checks for single text child', () => {
    const div1 = document.createElement('div');
    div1.textContent = 'text';
    expect(hasSingleTextChild(div1)).toBe(true);

    const div2 = document.createElement('div');
    div2.innerHTML = '<span>nested</span>';
    expect(hasSingleTextChild(div2)).toBe(false);
  });

  test('updates element only when text changes', () => {
    const div = document.createElement('div');
    
    // Case when text changes
    div.textContent = 'Test';
    updateElement(div);
    expect(div.innerHTML).toBe('<b>Te</b>st');
    
    // Case when text is already modified and should not change
    const modifiedHTML = div.innerHTML;
    updateElement(div);
    expect(div.innerHTML).toBe(modifiedHTML);
  });

  test('creates tree walker with correct configuration', () => {
    const treeWalker = createTreeWalker();
    
    // Check that TreeWalker is created with correct parameters
    expect(treeWalker.root).toBe(document.body);
    expect(treeWalker.whatToShow).toBe(config.dom.treeWalker.type);
    
    // Check filter
    const validElement = document.createElement('div');
    const invalidElement = document.createElement('script');
    
    expect(treeWalker.filter.acceptNode(validElement)).toBe(config.dom.treeWalker.filter.accept);
    expect(treeWalker.filter.acceptNode(invalidElement)).toBe(config.dom.treeWalker.filter.reject);
  });

  test('creates element info object', () => {
    const div = document.createElement('div');
    div.textContent = 'Test content';
    
    const info = createElementInfo(div);
    expect(info).toEqual({
      node: div,
      text: 'Test content'
    });
  });
});

describe('Page Update', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('updates page when extension is enabled', () => {
    const div = document.createElement('div');
    div.textContent = 'Test';
    document.body.appendChild(div);

    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ isEnabled: true });
    });

    updatePage();
    expect(div.innerHTML).toBe('<b>Te</b>st');
  });

  test('preserves original content when extension is disabled', () => {
    const div = document.createElement('div');
    div.textContent = 'Test';
    document.body.appendChild(div);

    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ isEnabled: false });
    });

    updatePage();
    expect(div.textContent).toBe('Test');
  });
}); 
