import config from '../config';

describe('Config', () => {
  describe('Languages', () => {
    test('contains settings for the Russian language', () => {
      expect(config.languages.ru).toBeDefined();
      expect(config.languages.ru.pattern).toBeDefined();
      expect(config.languages.ru.boldLength).toBe(3);
      expect('тест'.match(config.languages.ru.pattern)).toBeTruthy();
    });

    test('contains settings for the English language', () => {
      expect(config.languages.en).toBeDefined();
      expect(config.languages.en.pattern).toBeDefined();
      expect(config.languages.en.boldLength).toBe(2);
      expect('test'.match(config.languages.en.pattern)).toBeTruthy();
    });
  });

  describe('Config', () => {
    test('has correct default bold length', () => {
      expect(config.defaultBoldLength).toBe(1);
    });

    test('contains correct excluded tags', () => {
      expect(config.dom.excludedTags).toEqual(['script', 'style', 'noscript', 'iframe', 'b', 'code', 'pre', 'textarea', 'input', 'button']);
    });
  });

  describe('Module export', () => {
    test('exports the configuration object', () => {
      expect(config).toBeDefined();
      expect(Object.keys(config)).toEqual(
        expect.arrayContaining([
          'languages',
          'defaultLanguage',
          'defaultBoldLength',
          'constants',
          'dom',
          'storage',
          'icons',
          'performance',
        ])
      );
    });
  });

  describe('Storage', () => {
    test('has correct storage configuration', () => {
      expect(config.storage.keys.enabled).toBe('enabled');
      expect(config.storage.defaultState).toBe(true);
    });
  });

  describe('DOM Configuration', () => {
    test('has correct DOM settings', () => {
      expect(config.dom.boldTag).toBe('b');
      expect(config.dom.wordSeparator).toBeDefined();
      expect(config.dom.nodeTypes.text).toBe(Node.TEXT_NODE);
      expect(config.dom.nodeTypes.element).toBe(Node.ELEMENT_NODE);
    });

    test('has correct TreeWalker configuration', () => {
      expect(config.dom.treeWalker.filter.accept).toBe(NodeFilter.FILTER_ACCEPT);
      expect(config.dom.treeWalker.filter.reject).toBe(NodeFilter.FILTER_REJECT);
      expect(config.dom.treeWalker.type).toBe(NodeFilter.SHOW_TEXT);
    });

    test('has correct observer configuration', () => {
      expect(config.dom.observer.config.childList).toBe(true);
      expect(config.dom.observer.config.subtree).toBe(true);
      expect(config.dom.observer.config.characterData).toBe(true);
    });
  });

  describe('Icons', () => {
    test('has correct enabled icon configuration', () => {
      expect(config.icons.enabled.paths['16']).toBe('icons/button/smartReader-16.png');
      expect(config.icons.enabled.paths['32']).toBe('icons/button/smartReader-32.png');
      expect(config.icons.enabled.paths['48']).toBe('icons/smartReader-48.png');
      expect(config.icons.enabled.paths['128']).toBe('icons/smartReader-128.png');
    });

    test('has correct disabled icon configuration', () => {
      expect(config.icons.disabled.paths['16']).toBe('icons/button/smartReader-disabled-16.png');
      expect(config.icons.disabled.paths['32']).toBe('icons/button/smartReader-disabled-32.png');
      expect(config.icons.disabled.paths['48']).toBe('icons/button/smartReader-disabled-32.png');
      expect(config.icons.disabled.paths['128']).toBe('icons/button/smartReader-disabled-32.png');
    });
  });

  describe('Performance', () => {
    test('has correct performance configuration', () => {
      expect(config.performance.debounceTime).toBe(250);
      expect(config.performance.processingTimeThreshold).toBe(1000);
    });
  });
});
