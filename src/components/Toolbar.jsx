import React from 'react';
import Grab from '../icons/Grab.jsx';
import Pen from '../icons/Pen.jsx';
import Eraser from '../icons/Eraser.jsx';
import Tools from '../enums/Tools.js';
import Sticker from '../icons/Sticker.jsx';
import DropdownButton from './DropdownButton.jsx';
import { getDropdownOptions, StickerTypes } from '../enums/StickerTypes';
import Line from '../icons/Line.jsx';
import LineArrow from '../icons/LineArrow.jsx';
import LineTypes from '../enums/LineTypes';

const lineDropdown = [
    {id: LineTypes.DEFAULT, label: "Line", icon: Line},
    {id: LineTypes.ARROW, label: "Arrow", icon: LineArrow}
];

export default function Toolbar({selectedTool, setSelectedTool, setStickerType, setLineType}) {
    const getClassname = (tool) => {
        return tool == selectedTool ? "active" : ""
    }


    return (
        <div className="tool-bar">
            <button className={getClassname(Tools.PAN)} onClick={() => setSelectedTool(Tools.PAN)} title="Pan Tool"><Grab/></button>
            <DropdownButton 
                active={selectedTool === Tools.STICKER}
                onClick={() => setSelectedTool(Tools.STICKER)} 
                title="Sticker Tool"
                options = {getDropdownOptions()}
                onChange={(stickerType) => setStickerType(stickerType)}
                defaultValue={StickerTypes.DEFAULT}
            >
                <Sticker/>
            </DropdownButton>
            <DropdownButton
                active={selectedTool === Tools.PEN}
                onClick={() => setSelectedTool(Tools.PEN)}
                title="Pen Tool"
                options={lineDropdown}
                onChange={setLineType}
                defaultValue={LineTypes.DEFAULT}
            >
                <Pen/>
            </DropdownButton>
            <button className={getClassname(Tools.ERASER)} onClick={() => setSelectedTool(Tools.ERASER)} title="Eraser Tool"><Eraser/></button>
        </div>
    );
}