// Global setup for Selenium tests
beforeAll(async () => {
  // Set up any global configurations
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Clean up any global resources
});

// Increase timeout for all tests
jest.setTimeout(60000);
