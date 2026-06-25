import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist'],
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        'frontend/',
        '**/*.config.js',
        'dist/',
        'menu.js',
        'migrate-data.js',
        'setup-admin.js',
        'verify_withdrawal_fee.js',
        'prismaClient.js'
      ]
    }
  }
});
