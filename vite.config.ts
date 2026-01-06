import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@convex': path.resolve(__dirname, './convex'),
        },
    },
    server: {
        // custom port - 5173 is the default port for Vite
        port: 5173,

        // host
        // enable if you want to access the server from other devices on the network or through the internet
        host: true,
    },
});
