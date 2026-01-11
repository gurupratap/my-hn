import '@testing-library/jest-dom';

// MSW server setup for API mocking
// MSW v2 requires Node.js 18+ with fetch API. For tests that need API mocking,
// the server should be set up in a test file that uses testEnvironment: 'node'.
//
// For component tests using jsdom, mock API calls using Jest mocks instead.
// For adapter/service tests, use a separate config or inline testEnvironment override.
//
// Example usage in an adapter test file:
// /**
//  * @jest-environment node
//  */
// import { server } from '../mocks/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
