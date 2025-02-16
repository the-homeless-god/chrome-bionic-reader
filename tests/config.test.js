const path = require('path');
const config = require('../extension/config');

describe("Config", () => {
  describe("Languages", () => {
    test("contains settings for the Russian language", () => {
      expect(config.languages.ru).toBeDefined();
      expect(config.languages.ru.pattern).toBeDefined();
      expect(config.languages.ru.boldLength).toBe(3);
      expect('тест'.match(config.languages.ru.pattern)).toBeTruthy();
    });

    test("contains settings for the English language", () => {
      expect(config.languages.en).toBeDefined();
      expect(config.languages.en.pattern).toBeDefined();
      expect(config.languages.en.boldLength).toBe(2);
      expect('test'.match(config.languages.en.pattern)).toBeTruthy();
    });
  });

  describe("Config", () => {
    test("has correct default bold length", () => {
      expect(config.defaultBoldLength).toBe(2);
    });

    test("contains a list of excluded tags", () => {
      expect(config.excludedTags).toBeInstanceOf(Array);
      expect(config.excludedTags.length).toBeGreaterThan(0);

      // Check the presence of important tags
      const expectedTags = [
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
      ];
      
      expect(config.excludedTags).toEqual(expect.arrayContaining(expectedTags));
      expect(config.excludedTags.length).toBe(expectedTags.length);
    });
  });

  describe("Module export", () => {
    test("exports the configuration object", () => {
      expect(config).toBeInstanceOf(Object);
      expect(Object.keys(config)).toEqual(
        expect.arrayContaining([
          "languages",
          "defaultLanguage",
          "defaultBoldLength",
          "excludedTags",
          "storage",
          "dom",
          "icons"
        ])
      );
    });
  });

  describe("Storage", () => {
    test("has correct storage configuration", () => {
      expect(config.storage.keys.enabled).toBe("isEnabled");
      expect(config.storage.defaultState).toBe(false);
    });
  });

  describe("DOM Configuration", () => {
    test("has correct DOM settings", () => {
      expect(config.dom.boldTag).toBe("b");
      expect(config.dom.wordSeparator).toBeDefined();
      expect(config.dom.nodeTypes.text).toBe(3);
      expect(config.dom.nodeTypes.element).toBe(1);
    });

    test("has correct TreeWalker configuration", () => {
      expect(config.dom.treeWalker.filter.accept).toBe(1);
      expect(config.dom.treeWalker.filter.reject).toBe(2);
      expect(config.dom.treeWalker.type).toBe(1);
    });

    test("has correct observer configuration", () => {
      expect(config.dom.observer.config.childList).toBe(true);
      expect(config.dom.observer.config.subtree).toBe(true);
    });
  });

  describe("Icons", () => {
    test("has correct enabled icon configuration", () => {
      expect(config.icons.enabled.paths[16]).toBe("icons/button/smartReader-16.png");
      expect(config.icons.enabled.paths[32]).toBe("icons/button/smartReader-32.png");
      expect(config.icons.enabled.paths[48]).toBe("icons/smartReader-48.png");
      expect(config.icons.enabled.paths[128]).toBe("icons/smartReader-128.png");
    });

    test("has correct disabled icon configuration", () => {
      expect(config.icons.disabled.paths[16]).toBe("icons/button/smartReader-disabled-16.png");
      expect(config.icons.disabled.paths[32]).toBe("icons/button/smartReader-disabled-32.png");
      expect(config.icons.disabled.paths[48]).toBe("icons/smartReader-48.png");
      expect(config.icons.disabled.paths[128]).toBe("icons/smartReader-128.png");
    });
  });

  describe("Excluded Tags", () => {
    test("contains all necessary excluded tags", () => {
      const expectedTags = [
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
      ];
      
      expect(config.excludedTags).toEqual(expect.arrayContaining(expectedTags));
      expect(config.excludedTags.length).toBe(expectedTags.length);
    });
  });
});
