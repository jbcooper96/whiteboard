import React from 'react'
import {useState, useRef} from 'react'
import Board from './Board.jsx'
import ControlBar from './ControlBar.jsx'
import Tools from '../enums/Tools.js'
import ActionHistoryManager from '../utils/ActionHistoryManager.js';

const actionHistoryManager = new ActionHistoryManager();

export default function BoardWrapper() {
    const [canGoBackward, setCanGoBackward] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [useGrid, setUseGrid] = useState(false);
    const [selectedTool, setSelectedTool] = useState(Tools.PEN);
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
            <ControlBar canGoForward={canGoForward} canGoBackward={canGoBackward} clear={handleClear} selectedTool={selectedTool} 
                setSelectedTool={setSelectedTool} forward={handleForward} backward={handleBackward} useGrid={useGrid} toggleSnapToGrid={toggleSnapToGrid}/>
            <Board ref={board} checkHistory={checkHistory} selectedTool={selectedTool} actionHistoryManager={actionHistoryManager} useGrid={useGrid}/>
            <div className="paperOverlay"></div>
        </div>
    )
}