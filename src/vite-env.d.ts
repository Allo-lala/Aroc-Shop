/// <reference types="vite/client" />

export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
};
