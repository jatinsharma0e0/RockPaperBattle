export default {
  root: '.',
  publicDir: 'public',
  base: './',
  server: {
    port: 3000,
    open: true, 
    cors: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
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