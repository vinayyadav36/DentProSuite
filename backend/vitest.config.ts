import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      JWT_SECRET: 'test-secret-key-min-16-chars',
      STORAGE_ADAPTER: 'local',
    }
  },
})
