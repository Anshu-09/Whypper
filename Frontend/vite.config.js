import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
plugins: [react()],
server: {
// This proxies API requests to the Node.js backend during development
proxy: {
'/api': 'http://localhost:3000',
},
},
});