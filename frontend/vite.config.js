import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:5000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              console.log(
                '\n[vite] ⚠️  Backend not reachable at',
                proxyTarget,
                '\n       Start it with: cd backend && npm run dev\n'
              );
              if (res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    success: false,
                    message: `Backend unavailable. Start the API server: cd backend && npm run dev`,
                  })
                );
              }
            });
          },
        },
      },
    },
  };
});
