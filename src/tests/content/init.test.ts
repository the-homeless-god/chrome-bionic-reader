import { initializeExtension } from '@/content/init';

const mockUpdatePage = jest.fn();

jest.mock('@/content', () => ({
  updatePage: () => mockUpdatePage()
}));

jest.mock('@/background/storage', () => ({
  getState: () => Promise.resolve(true)
}));

describe('Content Script Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes extension when enabled', async () => {
    await initializeExtension();
    expect(mockUpdatePage).toHaveBeenCalled();
  });

  test.skip('skips initialization when disabled', async () => {
    jest.mock('@/background/storage', () => ({
      getState: () => Promise.resolve(false)
    }));
    
    await initializeExtension();
    expect(mockUpdatePage).not.toHaveBeenCalled();
  });
});
