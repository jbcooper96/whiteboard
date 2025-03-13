import React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useContext } from 'react';
import TextAlign from '../enums/TextAlign.js';
import { textSettingContext } from '../contexts/TextSettingsContext.jsx';
import Tools from '../enums/Tools.js';
import Directions from '../enums/Directions.js'
import TextEditor from './TextEditor.jsx';
import { StickerTypes } from '../enums/StickerTypes';
import TableEditor from './TableEditor';

const STICKER_PADDING = 20;

export default function Sticker({ setDragging, stickerId, xCoord, yCoord, width, height, text, setText, updateTextHistory, selectedTool, deleteSticker, resizeSticker, type, stickerAttachHoverCoords, showAttachHover }) {
    const [editing, setEditing] = useState(false)
    const textareaRef = useRef(null);
    const [resizeHover, setResizeHover] = useState(false);
    const { textSettings } = useContext(textSettingContext);

    useEffect(() => {
        function handleClickOutside(event) {
            if (textareaRef.current && !textareaRef.current.contains(event.target)) {
                changeContent();
            }
        }
        if (editing && textareaRef.current) {
            textareaRef.current.focus();
            document.addEventListener("click", handleClickOutside);
        }
        else {
            document.removeEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [editing]);


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

    const changeContent = () => {
        setEditing(false)
    }

    let className = editing ? "sticker editing" : "sticker noselect noedit"

    if (type === StickerTypes.TEXTBOX) {
        className += " text-box";
    }

    const showResize = () => {
        return !editing && resizeHover;
    }

    const clickResizer = (event, direction) => {
        event.stopPropagation();
        resizeSticker(stickerId, direction);
    }

    const onEditText = (newText) => {
        setText(newText, stickerId);
    }

    const updateHistory = (editor) => {
        updateTextHistory(stickerId, editor);
    }

    const setPadding = (style) => {
        const intWidth = parseInt(width);
        const intHeight = parseInt(height);
        if (intWidth < 2*STICKER_PADDING) {
            style.paddingLeft = "0px";
            style.paddingRight = "0px";
        }
        if (intHeight < 2*STICKER_PADDING) {
            style.paddingTop = "0px";
            style.paddingBottom = "0px";
        }
    }

    const style = {
        left: parseInt(xCoord), 
        top: parseInt(yCoord), 
        width: parseInt(width), 
        height: parseInt(height) 
    }

    setPadding(style);
    const stickerContent = () => {
        if (type === StickerTypes.TABLE)
            return (<TableEditor text={text} readonly={!editing} onEditText={onEditText} updateHistory={updateHistory}/>);
        else {
            return (<TextEditor text={text} ref={textareaRef} readonly={!editing} onEditText={onEditText} updateHistory={updateHistory}/>);
        }
    }
    return (
        <div onMouseDown={mouseDown} onDoubleClick={doubleClick} style={style} className={className}>
            
            {editing || <div className={"resizer top-left" + (showResize() ? "" : " hide")} onMouseDown={(event) => clickResizer(event, Directions.TOP_LEFT)} 
                onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className={"resizer top-right" + (showResize() ? "" : " hide")} onMouseDown={(event) => clickResizer(event, Directions.TOP_RIGHT)} 
                onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className={"resizer bottom-left" + (showResize() ? "" : " hide")} onMouseDown={(event) => clickResizer(event, Directions.BOTTOM_LEFT)} 
                onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className={"resizer bottom-right" + (showResize() ? "" : " hide")} onMouseDown={(event) => clickResizer(event, Directions.BOTTOM_RIGHT)} 
                onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className="resizer top" onMouseDown={(event) => clickResizer(event, Directions.TOP)} 
                style={{width: .6 * parseInt(width), left: .2 * parseInt(width)}} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className="resizer right" onMouseDown={(event) => clickResizer(event, Directions.RIGHT)} 
                style={{height: .6 * parseInt(height), top: .2 * parseInt(height)}} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className="resizer left" onMouseDown={(event) => clickResizer(event, Directions.LEFT)} 
                style={{height: .6 * parseInt(height), top: .2 * parseInt(height)}} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}
            {editing || <div className="resizer bottom" onMouseDown={(event) => clickResizer(event, Directions.BOTTOM)} 
                style={{width: .6 * parseInt(width), left: .2 * parseInt(width)}} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)}></div>}

            {showAttachHover && <div className="resizer" style={{left: stickerAttachHoverCoords.x - xCoord - 3, top: stickerAttachHoverCoords.y - yCoord - 3}}/>}
         
            
            {stickerContent()}

        </div>
    );
}