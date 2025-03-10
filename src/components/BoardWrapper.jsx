import React from 'react'
import { useState, useRef } from 'react'
import Board from './Board.jsx'
import ControlBar from './ControlBar.jsx'
import Tools from '../enums/Tools.js'
import ActionHistoryManager from '../utils/ActionHistoryManager.js';
import {TextSettingsProvider} from '../contexts/TextSettingsContext.jsx';
import { StickerTypes } from '../enums/StickerTypes';

const actionHistoryManager = new ActionHistoryManager();

export default function BoardWrapper() {
    const [canGoBackward, setCanGoBackward] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [useGrid, setUseGrid] = useState(false);
    const [selectedTool, setSelectedTool] = useState(Tools.STICKER);
    const [stickerType, setStickerType] = useState(StickerTypes.DEFAULT);
    const board = useRef(null);

    const handleClear = () => {
        board.current.clear();
    }

    const handleForward = () => {
        board.current.forward();
    }

    const handleBackward = () => {
        board.current.backward();
    }

    const toggleSnapToGrid = () => {
        setUseGrid(!useGrid);
    }

    const checkHistory = () => {
        setCanGoBackward(actionHistoryManager.canUndo());
        setCanGoForward(actionHistoryManager.canRedo());
    }

    return (
        <div>
            <TextSettingsProvider>
                <ControlBar canGoForward={canGoForward} canGoBackward={canGoBackward} clear={handleClear} selectedTool={selectedTool} setStickerType={setStickerType}
                    setSelectedTool={setSelectedTool} forward={handleForward} backward={handleBackward} useGrid={useGrid} toggleSnapToGrid={toggleSnapToGrid} />
                <Board ref={board} checkHistory={checkHistory} selectedTool={selectedTool} actionHistoryManager={actionHistoryManager} useGrid={useGrid} stickerType={stickerType}/>
                <div className="paperOverlay"></div>
            </TextSettingsProvider>
        </div>
    )
}