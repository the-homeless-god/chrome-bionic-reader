import { isValidNode, isTextNode, isValidParent } from '@/content/dom';
import config from '@/config';

describe('DOM Utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('isValidNode', () => {
    test('returns true for valid text node', () => {
      const textNode = document.createTextNode('test');
      expect(isValidNode(textNode)).toBe(true);
    });

    test('returns false for non-text node', () => {
      const element = document.createElement('div');
      expect(isValidNode(element)).toBe(false);
    });

    test('returns false for empty text node', () => {
      const textNode = document.createTextNode('');
      expect(isValidNode(textNode)).toBe(false);
    });

    test('returns false for whitespace text node', () => {
      const textNode = document.createTextNode('   ');
      expect(isValidNode(textNode)).toBe(false);
    });
  });

  describe('isTextNode', () => {
    test('returns true for text node', () => {
      const textNode = document.createTextNode('test');
      expect(isTextNode(textNode)).toBe(true);
    });

    test('returns false for element node', () => {
      const element = document.createElement('div');
      expect(isTextNode(element)).toBe(false);
    });
  });

  describe('isValidParent', () => {
    test('returns true for valid parent element', () => {
      const parent = document.createElement('div');
      expect(isValidParent(parent)).toBe(true);
    });

    test('returns false for excluded tag', () => {
      const script = document.createElement('script');
      expect(isValidParent(script)).toBe(false);
    });

    test('returns false for bold tag', () => {
      const bold = document.createElement('b');
      expect(isValidParent(bold)).toBe(false);
    });

    test('returns false for non-element node', () => {
      const textNode = document.createTextNode('test');
      expect(isValidParent(textNode)).toBe(false);
    });

    test('returns false for null node', () => {
      expect(isValidParent(null)).toBe(false);
    });

    test('returns false for processed element', () => {
      const div = document.createElement('div');
      config.state.processedElements.add(div);
      expect(isValidParent(div)).toBe(false);
    });
  });
}); 
