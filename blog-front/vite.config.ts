import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

// Vite 配置文档：https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appTitle = env.VITE_APP_TITLE || '枫叶小站';

  return {
    base: '/blog/',
    server: {
      proxy: {
        '/api-blog': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      },
    },
    plugins: [
      {
        name: 'html-app-title',
        transformIndexHtml(html) {
          return html.replace(/__APP_TITLE__/g, appTitle);
        },
      },
      vue(),
      tailwindcss(),
      Components({
        dts: 'src/components.d.ts',
        resolvers: [AntDesignVueResolver({ importStyle: false })],
      }),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});

