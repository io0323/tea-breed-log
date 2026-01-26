// jest.setup.ts
import '@testing-library/jest-dom';

import { TextDecoder, TextEncoder } from 'util';

// Setup for Node.js environment
Object.defineProperty(global, 'TextEncoder', {
  value: TextEncoder,
});

Object.defineProperty(global, 'TextDecoder', {
  value: TextDecoder,
});
