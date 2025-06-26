export default {
  root: '.',
  publicDir: 'assets',
  server: {
    port: 3000,
    open: true, // Automatically open browser on server start
    cors: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
}; 