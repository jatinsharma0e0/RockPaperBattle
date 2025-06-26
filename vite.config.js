export default {
  root: '.',
  publicDir: 'assets',
  base: './',
  server: {
    port: 3000,
    open: true, 
    cors: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
}; 