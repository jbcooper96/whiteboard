import React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useContext } from 'react';
import TextAlign from '../enums/TextAlign.js';
import { textSettingContext } from '../contexts/TextSettingsContext.jsx';
import Tools from '../enums/Tools.js';
import Directions from '../enums/Directions.js'


export default function Sticker({ setDragging, stickerId, xCoord, yCoord, width, height, text, setText, selectedTool, deleteSticker, resizeSticker }) {
    const [editing, setEditing] = useState(false)
    const textareaRef = useRef(null);
    const [resizeHover, setResizeHover] = useState(false);
    const { textSettings } = useContext(textSettingContext);

    useEffect(() => {
        if (editing && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [editing]);

    const content = text ? text : "Enter text here...";

    const mouseDown = (event) => {
        if (selectedTool === Tools.ERASER) {
            deleteSticker(stickerId);
        }
        else if (!editing) {
            setDragging(stickerId);
        }
        event.stopPropagation();
    }

    const doubleClick = (event) => {
        setEditing(!editing);
        event.stopPropagation();
    }

    if (editing && textareaRef.current) {
        textareaRef.current.focus();
    }

    const changeContent = (event) => {
        setEditing(false)
        setText(event.target.innerHTML, stickerId);
    }

    const className = editing ? "sticker editing" : "sticker noselect noedit"
    const showResize = () => {
        return !editing && resizeHover;
    }

    const clickResizer = (event, direction) => {
        event.stopPropagation();
        resizeSticker(stickerId, direction, event.clientX, event.clientY);
    }

    const getAlignClassname = () => {
        let alignClassname = "";
        if (textSettings.horizontalAlign === TextAlign.LEFT) {
            alignClassname += "horizontal-left ";
        }
        else if (textSettings.horizontalAlign === TextAlign.CENTER) {
            alignClassname += "horizontal-center ";
        }
        else if (textSettings.horizontalAlign === TextAlign.RIGHT) {
            alignClassname += "horizontal-right ";
        }

        if (textSettings.verticalAlign === TextAlign.TOP) {
            alignClassname += "vertical-top";
        }
        else if (textSettings.verticalAlign === TextAlign.CENTER) {
            alignClassname += "vertical-center";
        }
        else if (textSettings.verticalAlign === TextAlign.BOTTOM) {
            alignClassname += "vertical-bottom";
        }
        return alignClassname;
    }

    return (
        <div onMouseDown={mouseDown} onDoubleClick={doubleClick} style={{ left: parseInt(xCoord), top: parseInt(yCoord), width: parseInt(width), height: parseInt(height) }} className={className}>
            
            {editing || <div className={"resizer top-left" + (showResize() ? "" : " hide")} onMouseDown={(event) => clickResizer(event, Directions.TOP_LEFT)} 
                onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className={"resizer top-right" + (showResize() ? "" : " hide")} onMouseDown={(event) => clickResizer(event, Directions.TOP_RIGHT)} 
                onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className={"resizer bottom-left" + (showResize() ? "" : " hide")} onMouseDown={(event) => clickResizer(event, Directions.BOTTOM_LEFT)} 
                onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className={"resizer bottom-right" + (showResize() ? "" : " hide")} onMouseDown={(event) => clickResizer(event, Directions.BOTTOM_RIGHT)} 
                onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className="resizer top" onMouseDown={(event) => clickResizer(event, Directions.TOP)} 
                style={{width: parseInt(width)}} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className="resizer right" onMouseDown={(event) => clickResizer(event, Directions.RIGHT)} 
                style={{height: parseInt(height)}} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className="resizer left" onMouseDown={(event) => clickResizer(event, Directions.LEFT)} 
                style={{height: parseInt(height)}} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className="resizer bottom" onMouseDown={(event) => clickResizer(event, Directions.BOTTOM)} 
                style={{width: parseInt(width)}} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
         
            <span ref={textareaRef} contentEditable={editing} onBlur={changeContent} className={getAlignClassname()} dangerouslySetInnerHTML={{__html: content}}></span>

        </div>
    );
}

//<textarea ref={textareaRef} onBlur={changeContent} defaultValue={content}></textarea>