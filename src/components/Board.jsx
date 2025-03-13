import React from 'react'
import { useState, useRef, useEffect, useImperativeHandle, useCallback, useReducer } from 'react'
import StickerCmp from './Sticker.jsx'
import FileUtil from '../utils/FileUtil.js';
import Tools from '../enums/Tools.js';
import LinePoint from '../enums/LinePoint.js';
import LineReducerActions from '../enums/LineReducerActions.js';
import StickerReducerActions from '../enums/StickerReducerActions.js';
import CanvisLogicHandler from '../utils/CanvasLogicHandler.js';
import BoardStates from '../enums/BoardStates';
import debounce from '../utils/Debounce.js';
import DirectionUtil from '../utils/DirectionUtil.js';
import Canvas from './Canvas.jsx';
import getLineId from "../utils/LineIdGenerator.js";
import stickerReducer from '../reducers/StickerReducer.js';
import lineReducer from '../reducers/LineReducer.js';
import getStickerId from '../utils/StickerIdGenerator.js';
import BoardEvent from '../eventhandlers/BoardEvent';
import EventHandlersManager from '../eventhandlers/EventHandlersManager';
import { LINE_POINT_HOVER_CIRCLE_RADIUS, LINE_POINT_EDIT_CIRCLE_RADIUS } from '../constants';

const eventManager = new EventHandlersManager();

export default function Board({ ref, checkHistory, useGrid, selectedTool, actionHistoryManager, stickerType, lineType }) {
    const GRID_INCREMENT = 25;
    const [stickers, dispatchStickers] = useReducer(stickerReducer, []);
    const [lines, dispatchLines] = useReducer(lineReducer, []);
    const [stickerAttachHoverCoords, setStickerAttachHoverCoords] = useState(null);

    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const drawingStartIsAttachedToSticker = useRef(false);
    const drawingStartAttachedSticker = useRef(null);
    const canvas = useRef(null);
    const hoveringLinePoint = useRef(false);
    const lineBeingHoveredId = useRef(null);
    const linePointBeingHoveredId = useRef(null);
    const board = useRef(null);

    const updateFile = useCallback(() => {
        const newFile = FileUtil.getFileObject(lines, stickers);
        window.electronAPI.updateFile(newFile);

    }, [lines, stickers]);

    useEffect(() => {
        window.electronAPI.onUpdateFile((defaultFile) => {
            const { newStickers, newLines } = FileUtil.parseFileObject(defaultFile, getLineId, getStickerId);
            dispatchStickerWrapper({ type: StickerReducerActions.SET_STICKERS, stickers: newStickers });
            dispatchLines({ type: LineReducerActions.SET_LINES, lines: newLines });
        })

    }, []);

    useImperativeHandle(ref, () => {
        return {
            forward: () => {
                forward();
            },
            backward: () => {
                backward();
            },
            clear: () => {
                clear();
            }
        }
    }, [stickers, lines])

    const dispatchStickerWrapper = (action) => {
        action.dispatchLines = dispatchLines;
        dispatchStickers(action);
    }

    const toBoardCoordsX = (clientX) => {
        const rect = board.current.getBoundingClientRect();
        return clientX - rect.left;
    }

    const toBoardCoordsY = (clientY) => {
        const rect = board.current.getBoundingClientRect();
        return clientY - rect.top;
    }

    const canvasCoordsToBoardCoordsX = (x) => {
        const boardRect = board.current.getBoundingClientRect();
        const canvasRect = canvas.current.getBoundingClientRect();
        return x + canvasRect.left - boardRect.left;
    }

    const canvasCoordsToBoardCoordsY = (y) => {
        const boardRect = board.current.getBoundingClientRect();
        const canvasRect = canvas.current.getBoundingClientRect();
        return y + canvasRect.top - boardRect.top;
    }

    const snapToGrid = (coord) => {
        if (useGrid) {
            const modulus = coord % GRID_INCREMENT;
            const coordRoundDown = coord - (coord % GRID_INCREMENT);
            return (modulus < (GRID_INCREMENT / 2)) ? coordRoundDown : coordRoundDown + GRID_INCREMENT;
        }
        else {
            return coord;
        }
    }

    const backward = () => {
        actionHistoryManager.undo(dispatchLines, dispatchStickerWrapper, lines, stickers);
        checkHistory();
    }

    const forward = () => {
        actionHistoryManager.redo(dispatchLines, dispatchStickerWrapper, lines, stickers);
        checkHistory();
    }

    const setDrag = (stickerId) => {
        actionHistoryManager.addToHistory(lines, stickers);
        checkHistory();
        eventManager.startDragging(stickerId);
    }

    const historyCheckin = () => {
        actionHistoryManager.addToHistory(lines, stickers);
        checkHistory();
    }

    const createBoardEvent = (clientX, clientY, moveX=0, moveY=0) => {
        return new BoardEvent(
            dispatchStickerWrapper, dispatchLines, canvas.current.getBoundingClientRect, canvas.current.drawLine, 
            canvas.current.drawCircle, canvas.current.redraw, snapToGrid, setStickerAttachHoverCoords, toBoardCoordsX, 
            toBoardCoordsY, historyCheckin, canvasCoordsToBoardCoordsX, canvasCoordsToBoardCoordsY, lines, stickers, 
            clientX, clientY, moveX, moveY, stickerType, lineType, stickerAttachHoverCoords
        );
    }

    const mouseUp = (event) => {
        const boardEvent = createBoardEvent(event.clientX, event.clientY);
        eventManager.mouseUp(boardEvent);
        drawingStartIsAttachedToSticker.current = false;
    }

    const checkHover = debounce((event) => {
        if (hoveringLinePoint.current) {
            canvas.current.redraw();
            hoveringLinePoint.current = false;
        }
        if (selectedTool === Tools.ERASER) {
            const rect = canvas.current.getBoundingClientRect();
            let anyHover = false;
            for (let line of lines) {
                anyHover = CanvisLogicHandler.checkIfLineHover(event.clientX - rect.left, event.clientY - rect.top, line);
                if (anyHover) {
                    dispatchLines({ type: LineReducerActions.HOVER_LINE, id: line.id });
                    break;
                }
            }
            if (anyHover) {
                document.body.style.cursor = "pointer";
            }
            else {
                document.body.style.cursor = "default";
                dispatchLines({ type: LineReducerActions.RESET_HOVER });
            }

        }
        else if (eventManager.eventHandler.lineBeingEditiedId === undefined) {
            const rect = canvas.current.getBoundingClientRect();
            const { hovering, lineId, point, linePointType } = CanvisLogicHandler.checkIfLinePointHover(lines, event.clientX - rect.left, event.clientY - rect.top);
            if (hovering) {
                hoveringLinePoint.current = hovering;
                lineBeingHoveredId.current = lineId;
                linePointBeingHoveredId.current = linePointType;
                canvas.current.redraw();
                canvas.current.drawCircle(point.x, point.y, LINE_POINT_HOVER_CIRCLE_RADIUS);
            }
        }
    }, 200)

    const mouseMove = (event) => {
        let moveX = event.clientX - mouseX.current;
        let moveY = event.clientY - mouseY.current;

        mouseX.current = event.clientX;
        mouseY.current = event.clientY;

        const boardEvent = createBoardEvent(event.clientX, event.clientY, moveX, moveY);
        eventManager.mouseMove(boardEvent);

        checkHover(event);
    }

    const mouseDown = (event) => {
        const rect = canvas.current.getBoundingClientRect();
        if (hoveringLinePoint.current) {
            actionHistoryManager.addToHistory(lines, stickers);
            checkHistory();
            canvas.current.redraw();
            let point;
            for (let line of lines) {
                if (line.id === lineBeingHoveredId.current) {
                    point = linePointBeingHoveredId.current === LinePoint.START ? line.start : line.end;
                    break;
                }
            }
            canvas.current.drawCircle(point?.x, point?.y, LINE_POINT_EDIT_CIRCLE_RADIUS);
            eventManager.editLine(lineBeingHoveredId.current, linePointBeingHoveredId.current);
        }
        else if (selectedTool === Tools.PEN) {
            const xCanvasCoord = event.clientX - rect.left;
            const yCanvasCoord = event.clientY - rect.top;
            let drawingStartX = snapToGrid(xCanvasCoord);
            let drawingStartY = snapToGrid(yCanvasCoord);
            const { stickerId, attachPoint } = CanvisLogicHandler.getStickersToAttachTo(stickers, canvasCoordsToBoardCoordsX(xCanvasCoord), canvasCoordsToBoardCoordsX(yCanvasCoord));
            drawingStartIsAttachedToSticker.current = !!attachPoint;
            if (attachPoint) {
                drawingStartAttachedSticker.current = stickerId;
                drawingStartX = attachPoint.x;
                drawingStartY = attachPoint.y;
            }
            eventManager.startDrawing(drawingStartX, drawingStartY, drawingStartAttachedSticker.current, drawingStartIsAttachedToSticker.current);
        }
        else if (selectedTool === Tools.STICKER) {
            eventManager.createAndResizeSticker(event.clientX, event.clientY);
        }
    }

    const clear = () => {
        actionHistoryManager.clear();
        checkHistory();
        dispatchLines({ type: LineReducerActions.CLEAR_LINES });
        dispatchStickerWrapper({ type: StickerReducerActions.CLEAR_STICKERS });
    }


    const doubleClick = (event) => {
        let newSticker = {
            x: snapToGrid(toBoardCoordsX(event.clientX)),
            y: snapToGrid(toBoardCoordsY(event.clientY)),
            realX: toBoardCoordsX(event.clientX),
            realY: toBoardCoordsY(event.clientY),
            type: stickerType
        };
        actionHistoryManager.addToHistory(lines, stickers);
        checkHistory();
        dispatchStickerWrapper({ type: StickerReducerActions.ADD_STICKER, sticker: newSticker });
    }

    const changeText = (text, stickerId) => {
        dispatchStickerWrapper({ type: StickerReducerActions.CHANGE_TEXT, text: text, stickerId: stickerId });
    }

    const updateTextHistory = (stickerId, editor) => {
        if (editor) {
            actionHistoryManager.addTextChangeToHistory(editor, stickerId);
            checkHistory();
        }
    }

    const onClick = (event) => {
        if (selectedTool === Tools.ERASER) {
            for (let line of lines) {
                if (line.hover) {
                    actionHistoryManager.addToHistory(lines, stickers);
                    checkHistory();
                    dispatchLines({ type: LineReducerActions.REMOVE_LINE, id: line.id });
                    break;
                }
            }


        }
    }

    const deleteSticker = (stickerId) => {
        const stickersToDelete = stickers.filter(s => s.stickerId === stickerId);
        if (stickersToDelete?.length === 1) {
            actionHistoryManager.addToHistory(lines, stickers);
            checkHistory();
            dispatchStickerWrapper({ type: StickerReducerActions.REMOVE_STICKER, stickerId: stickerId });
        }
    }

    const startResizingSticker = (stickerId, direction) => {
        actionHistoryManager.addToHistory(lines, stickers);
        checkHistory();
        const sticker = stickers.find(s => s.stickerId === stickerId);
        const [anchorX, anchorY] = DirectionUtil.getAnchorPointFromDirection(direction, sticker);
        eventManager.resizeSticker(anchorX, anchorY, stickerId, direction);
    }

    const getShouldShowStickerAttachHover = (stickerId) => {
        return stickerAttachHoverCoords && stickerAttachHoverCoords.stickerId === stickerId 
            && (!drawingStartIsAttachedToSticker.current || stickerAttachHoverCoords.stickerId !== drawingStartAttachedSticker.current);
    }

    updateFile();

    return (
        <div ref={board} onClick={onClick} onDoubleClick={doubleClick} onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseMove={mouseMove} className='board'>
            <Canvas ref={canvas} lines={lines} eventManager={eventManager}/>
            {stickers.map(sticker =>
                <StickerCmp key={sticker.stickerId} setDragging={setDrag} stickerId={sticker.stickerId} xCoord={sticker.x} resizeSticker={startResizingSticker} updateTextHistory={updateTextHistory}
                    yCoord={sticker.y} text={sticker.text} setText={changeText} selectedTool={selectedTool} deleteSticker={deleteSticker} width={sticker.width} height={sticker.height} 
                    type={sticker.type} showAttachHover={getShouldShowStickerAttachHover(sticker.stickerId)} stickerAttachHoverCoords={stickerAttachHoverCoords}/>
            )}
        </div>
    );
}