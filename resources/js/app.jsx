import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './src/i18n';
import Main from './Main';
import './bootstrap';
import '../css/app.css';

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <Main />
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>
);