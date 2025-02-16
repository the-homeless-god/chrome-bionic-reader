import './mocks/chrome';
import { processText } from '@/content/text';
import { createTreeWalker, isTextNode, isValidElement } from '@/content/dom';
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
    const div = document.createElement('div');
    expect(isValidElement(div)).toBe(true);

    const script = document.createElement('script');
    expect(isValidElement(script)).toBe(false);
  });

  test('creates tree walker with correct configuration', () => {
    const treeWalker = createTreeWalker(document.body);
    expect(treeWalker.root).toBe(document.body);
  });
});

describe('Text processing', () => {
  describe('processText', () => {
    it('should handle empty string', () => {
      expect(processText('')).toBe('');
    });

    it('should handle single space', () => {
      expect(processText(' ')).toBe(' ');
    });

    it('should process English word correctly', () => {
      expect(processText('test')).toBe('t<b>est</b>');
    });

    it('should process Russian word correctly', () => {
      expect(processText('тест')).toBe('те<b>ст</b>');
    });

    it('should process mixed text correctly', () => {
      expect(processText('test тест')).toBe('t<b>est</b> те<b>ст</b>');
    });

    it('should handle multiple spaces', () => {
      expect(processText('test  тест')).toBe('t<b>est</b> те<b>ст</b>');
    });

    it('should handle short words', () => {
      expect(processText('a т')).toBe('a<b></b> т<b></b>');
    });

    it('should handle punctuation', () => {
      expect(processText('test, тест!')).toBe('t<b>est,</b> те<b>ст!</b>');
    });
  });
});
