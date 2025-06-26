export default {
  root: '.',
  publicDir: 'public',
  base: './',
  server: {
    port: 3000,
    open: true, 
    cors: true,
    headers: {
      // Ensure proper MIME types when serving locally
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/javascript; charset=utf-8'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Keep consistent file naming without hashes
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
            return `assets/images/[name][extname]`;
          }
          if (/\.(wav|mp3|ogg|aac|flac)$/i.test(assetInfo.name)) {
            return `assets/audio/[name][extname]`;
          }
          return `assets/[name][extname]`;
        },
      },
    },
  }
}; 