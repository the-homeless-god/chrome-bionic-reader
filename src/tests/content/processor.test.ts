import { processElement, processNode } from '@/content/processor';

jest.mock('@/content/text', () => ({
  processText: jest.fn((text: string) => {
    const words = text.split(' ');
    return words
      .map((word) => {
        const firstPart = word.slice(0, word.length > 3 ? 2 : 1);
        const restPart = word.slice(word.length > 3 ? 2 : 1);
        return `<b>${firstPart}</b>${restPart}`;
      })
      .join(' ');
  }),
}));

describe('Content Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('Element Processing', () => {
    test('processes element with text content', () => {
      const element = document.createElement('div');
      element.textContent = 'test текст';
      document.body.appendChild(element);

      processElement(element);
      expect(element.innerHTML).toBe('<b>te</b>st <b>те</b>кст');
    });

    test('skips element without text content', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      processElement(element);
      expect(element.innerHTML).toBe('');
    });

    test('marks element as processed', () => {
      const element = document.createElement('div');
      element.textContent = 'test';
      document.body.appendChild(element);

      processElement(element);
      processElement(element); // Second call should not modify element
      expect(element.innerHTML.match(/<b>/g)?.length).toBe(1);
    });
  });

  describe('Node Processing', () => {
    test('processes text node', () => {
      const div = document.createElement('div');
      const textNode = document.createTextNode('test текст');
      div.appendChild(textNode);
      document.body.appendChild(div);

      processNode(textNode);
      expect(div.innerHTML).toBe('<b>te</b>st <b>те</b>кст');
    });

    test('skips non-text node', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      processNode(div);
      expect(div.innerHTML).toBe('');
    });

    test('skips invalid parent element', () => {
      const script = document.createElement('script');
      const textNode = document.createTextNode('test');
      script.appendChild(textNode);
      document.body.appendChild(script);

      processNode(textNode);
      expect(script.innerHTML).toBe('test');
    });
  });
});
