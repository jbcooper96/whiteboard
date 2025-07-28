import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import BoardWrapper from './components/BoardWrapper.jsx'

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BoardWrapper />
    </React.StrictMode>
);
