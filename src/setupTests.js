import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Antes y después de cada prueba se parte desde cero
afterEach(() => {
  cleanup();
  localStorage.clear();
});
