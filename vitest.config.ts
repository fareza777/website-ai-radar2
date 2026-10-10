import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/**/*.test.ts'], coverage: { provider: 'v8', include: ['src/lib/intelligence.ts', 'src/lib/filter.ts', 'src/lib/collector.ts'], thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 } } } });
