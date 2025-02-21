import React from 'react'
import { useState, useRef, useEffect } from 'react'
import Tools from '../enums/Tools.js';
import Directions from '../enums/Directions.js'

export default function Sticker({ setDragging, stickerId, xCoord, yCoord, width, height, text, setText, selectedTool, deleteSticker, resizeSticker }) {
    const [editing, setEditing] = useState(false)
    const textareaRef = useRef(null);
    const [resizeHover, setResizeHover] = useState(false);

    const content = text ? text : "Enter text here...";

    useEffect(() => {
        if (editing && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [editing]);

    const mouseDown = (event) => {
        console.log("mouseDOWN")
        console.log(selectedTool)
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
        setText(event.target.value, stickerId);
    }

    const className = editing ? "sticker editing" : "sticker noselect noedit"
    const showResize = () => {
        return !editing && resizeHover;
    }

    const clickResizer = (event, direction) => {
        event.stopPropagation();
        resizeSticker(stickerId, direction, event.clientX, event.clientY);
    }

    return (
        <div onMouseDown={mouseDown} onDoubleClick={doubleClick} style={{ left: parseInt(xCoord), top: parseInt(yCoord), width: parseInt(width), height: parseInt(height) }} className={className}>
            
            <div className={"resizer top-left" + (showResize() ? "" : " hide")} onMouseDown={(event) => clickResizer(event, Directions.TOP_LEFT)} 
                onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>
            <div className={"resizer top-right" + (showResize() ? "" : " hide")} onMouseDown={(event) => clickResizer(event, Directions.TOP_RIGHT)} 
                onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>
            <div className={"resizer bottom-left" + (showResize() ? "" : " hide")} onMouseDown={(event) => clickResizer(event, Directions.BOTTOM_LEFT)} 
                onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>
            <div className={"resizer bottom-right" + (showResize() ? "" : " hide")} onMouseDown={(event) => clickResizer(event, Directions.BOTTOM_RIGHT)} 
                onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>
            <div className="resizer top" onMouseDown={(event) => clickResizer(event, Directions.TOP)} 
                style={{width: parseInt(width)}} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>
            <div className="resizer right" onMouseDown={(event) => clickResizer(event, Directions.RIGHT)} 
                style={{height: parseInt(height)}} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>
            <div className="resizer left" onMouseDown={(event) => clickResizer(event, Directions.LEFT)} 
                style={{height: parseInt(height)}} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>
            <div className="resizer bottom" onMouseDown={(event) => clickResizer(event, Directions.BOTTOM)} 
                style={{width: parseInt(width)}} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>
            {
                !editing
                    ? <span>{content}</span>
                    : <textarea ref={textareaRef} onBlur={changeContent} defaultValue={content}></textarea>
            }

        </div>
    );
}