import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// Get git commit timestamp
const getGitTimestamp = () => {
  try {
    // Get the timestamp of the latest commit
    const timestamp = execSync('git log -1 --format=%ct', { encoding: 'utf8' }).trim()
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    })
  } catch (error) {
    // Fallback if git is not available
    return new Date().toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    })
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __GIT_LAST_UPDATED__: JSON.stringify(getGitTimestamp())
  },
  base: '/brc-bed-map/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'merged_map_full.svg') {
            return '[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
