import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import axios from 'axios';
import { route } from 'ziggy-js';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Configure CSRF token for all requests
const token = document.head.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;

if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    (window as any).axios = axios;

    console.log('CSRF token configured:', token.content.substring(0, 10) + '...');
} else {
    console.error('CSRF token not found in meta tag');
}

// ⬅️ dodaj global route
(window as any).route = route;


createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
