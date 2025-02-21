import React from 'react';
import { createRoot } from 'react-dom/client';
import BoardWrapper from './components/BoardWrapper.jsx'

const root = createRoot(document.body);
root.render(
    <React.StrictMode>
        <BoardWrapper />
    </React.StrictMode>
);
