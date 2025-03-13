import React from 'react';
import Grid from '../icons/Grid.jsx';
import Clear from '../icons/Clear.jsx'
import Forward from '../icons/Forward.jsx'
import Backward from '../icons/Backward.jsx';
import Toolbar from './Toolbar.jsx';
import TextSettings from './TextSettings.jsx';

export default function ControlBar({canGoBackward, canGoForward, clear, forward, backward, useGrid, toggleSnapToGrid, selectedTool, setSelectedTool, setStickerType, setLineType}) {

    return (
        <div className='control-bar'>
            <button onClick={clear}><Clear/></button>

            {canGoBackward ? <button onClick={backward}><Backward/></button> 
            : <button disabled onClick={backward}><Backward/></button>}

            {canGoForward ? <button onClick={forward}><Forward/></button> 
            : <button disabled onClick={forward}><Forward/></button>}

            {useGrid ? <button className="active" title="Toggle Grid" onClick={toggleSnapToGrid}><Grid/></button>
            : <button title="Toggle Grid" onClick={toggleSnapToGrid}><Grid/></button>}

            <Toolbar setStickerType={setStickerType} selectedTool={selectedTool} setSelectedTool={setSelectedTool} setLineType={setLineType}/>

            <TextSettings/>
        </div>
    );
}