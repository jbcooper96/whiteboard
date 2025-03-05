import React from 'react';
import Grab from '../icons/Grab.jsx';
import Pen from '../icons/Pen.jsx';
import Eraser from '../icons/Eraser.jsx';
import Tools from '../enums/Tools.js';
import Sticker from '../icons/Sticker.jsx';


export default function Toolbar({selectedTool, setSelectedTool}) {
    const getClassname = (tool) => {
        return tool == selectedTool ? "active" : ""
    }


    return (
        <div className="tool-bar">
            <button className={getClassname(Tools.PAN)} onClick={() => setSelectedTool(Tools.PAN)} title="Pan Tool"><Grab/></button>
            <button className={getClassname(Tools.STICKER)} onClick={() => setSelectedTool(Tools.STICKER)} title="Sticker Tool"><Sticker/></button>
            <button className={getClassname(Tools.PEN)} onClick={() => setSelectedTool(Tools.PEN)} title="Pen Tool"><Pen/></button>
            <button className={getClassname(Tools.ERASER)} onClick={() => setSelectedTool(Tools.ERASER)} title="Eraser Tool"><Eraser/></button>
        </div>
    );
}