const path = require('path');
const config = require('../extension/config');

describe("Config", () => {
  describe("Languages", () => {
    test("contains settings for the Russian language", () => {
      expect(config.languages.russian).toBeDefined();
      expect(config.languages.russian.pattern).toBeDefined();
      expect(config.languages.russian.boldLength).toBe(3);

      // Check the work of the regular expression
      expect(config.languages.russian.pattern.test("а")).toBe(true);
      expect(config.languages.russian.pattern.test("я")).toBe(true);
      expect(config.languages.russian.pattern.test("Ё")).toBe(true);
      expect(config.languages.russian.pattern.test("a")).toBe(false);
    });

    test("contains settings for the English language", () => {
      expect(config.languages.english).toBeDefined();
      expect(config.languages.english.pattern).toBeDefined();
      expect(config.languages.english.boldLength).toBe(2);

      // Check the work of the regular expression
      expect(config.languages.english.pattern.test("a")).toBe(true);
      expect(config.languages.english.pattern.test("Z")).toBe(true);
      expect(config.languages.english.pattern.test("я")).toBe(false);
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
      expect(config.excludedTags).toContain("SCRIPT");
      expect(config.excludedTags).toContain("STYLE");
      expect(config.excludedTags).toContain("INPUT");
      expect(config.excludedTags).toContain("TEXTAREA");
    });
  });

  describe("Module export", () => {
    test("exports the configuration object", () => {
      expect(config).toBeInstanceOf(Object);
      expect(Object.keys(config)).toEqual(
        expect.arrayContaining([
          "languages",
          "defaultBoldLength",
          "excludedTags",
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
      expect(config.dom.nodeTypes.text).toBe(Node.TEXT_NODE);
      expect(config.dom.nodeTypes.element).toBe(Node.ELEMENT_NODE);
    });

    test("has correct TreeWalker configuration", () => {
      expect(config.dom.treeWalker.filter.accept).toBe(NodeFilter.FILTER_ACCEPT);
      expect(config.dom.treeWalker.filter.reject).toBe(NodeFilter.FILTER_REJECT);
      expect(config.dom.treeWalker.type).toBe(NodeFilter.SHOW_ELEMENT);
    });

    test("has correct observer configuration", () => {
      expect(config.dom.observer.config.childList).toBe(true);
      expect(config.dom.observer.config.subtree).toBe(true);
    });
  });

  describe("Icons", () => {
    test("has correct enabled icon configuration", () => {
      expect(config.icons.enabled.prefix).toBe("icon");
      expect(config.icons.enabled.sizes[16]).toBe("16.png");
      expect(config.icons.enabled.sizes[48]).toBe("48.png");
      expect(config.icons.enabled.sizes[128]).toBe("128.png");
    });

    test("has correct disabled icon configuration", () => {
      expect(config.icons.disabled.prefix).toBe("icon-disabled");
      expect(config.icons.disabled.sizes[16]).toBe("16.png");
      expect(config.icons.disabled.sizes[48]).toBe("48.png");
      expect(config.icons.disabled.sizes[128]).toBe("128.png");
    });
  });

  describe("Excluded Tags", () => {
    test("contains all necessary excluded tags", () => {
      const expectedTags = [
        "SCRIPT", "STYLE", "PRE", "CODE", "TEXTAREA",
        "INPUT", "SELECT", "OPTION", "BUTTON", "IMG",
        "SVG", "CANVAS", "MATH", "NOSCRIPT", "TEMPLATE"
      ];
      
      expect(config.excludedTags).toEqual(expect.arrayContaining(expectedTags));
      expect(config.excludedTags.length).toBe(expectedTags.length);
    });
  });
});
