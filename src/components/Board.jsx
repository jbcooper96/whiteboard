import React from 'react'
import { useState, useRef, useEffect, useImperativeHandle, useCallback, useReducer } from 'react'
import Sticker from './Sticker.jsx'
import FileUtil from '../utils/FileUtil.js';
import Actions from '../enums/Actions.js';
import Tools from '../enums/Tools.js';
import LinePoint from '../enums/LinePoint.js';
import LineReducerActions from '../enums/LineReducerActions.js';
import StickerReducerActions from '../enums/StickerReducerActions.js';
import CanvisLogicHandler from '../utils/CanvasLogicHandler.js';
import BoardStates from '../enums/BoardStates.js';
import Directions from '../enums/Directions.js';
import DirectionUtil from '../utils/DirectionUtil.js';

let lineId = 0;

const getLineId = () => {
    lineId += 1;
    return lineId - 1;
}

let stickerId = 0;

const getStickerId = () => {
    stickerId += 1;
    return stickerId - 1;
}


const LINE_POINT_HOVER_CIRCLE_RADIUS = 4;
const LINE_POINT_EDIT_CIRCLE_RADIUS = 6;
const DEFAULT_STICKER_HEIGHT = 50;
const DEFAULT_STICKER_WIDTH = 200;

const MIN_DRAG_TO_CREATE_STICKER = 20;

const setDefaultStickerSize = (newSticker) => {
    if (newSticker.width === undefined) newSticker.width = DEFAULT_STICKER_WIDTH;
    if (newSticker.height === undefined) newSticker.height = DEFAULT_STICKER_HEIGHT;
}

function stickerReducer(state, action) {
    switch (action.type) {
        case StickerReducerActions.ADD_STICKER: {
            if (action.sticker.stickerId === undefined)
                action.sticker.stickerId = getStickerId();
            setDefaultStickerSize(action.sticker);
            return [...state, action.sticker];
        }
        case StickerReducerActions.REMOVE_STICKER: {
            const newStickers = state.map(s => { return { ...s } });
            return newStickers.filter(s => s.stickerId !== action.stickerId);
        }
        case StickerReducerActions.CHANGE_TEXT: {
            return state.map(stickerOld => {
                if (stickerOld.stickerId != action.stickerId) {
                    return stickerOld;
                }
                else {
                    return { ...stickerOld, text: action.text }
                }
            });
        }
        case StickerReducerActions.CLEAR_STICKERS: {
            return [];
        }
        case StickerReducerActions.MOVE_STICKER: {
            return state.map(stickerOld => {
                if (stickerOld.stickerId != action.stickerId) {
                    return stickerOld;
                }
                else {
                    return {
                        ...stickerOld,
                        x: action.x ? action.x : stickerOld.x,
                        y: action.y ? action.y : stickerOld.y,
                        realX: action.realX ? action.realX : stickerOld.realX,
                        realY: action.realY ? action.realY : stickerOld.realY
                    }
                }
            });
        }
        case StickerReducerActions.SET_STICKERS: {
            action.stickers = action.stickers.map(s => {
                const newSticker = { ...s };
                setDefaultStickerSize(newSticker);
                return newSticker;
            });
            return action.stickers;
        }
        case StickerReducerActions.RESIZE_STICKER: {
            return state.map(stickerOld => {
                if (stickerOld.stickerId != action.stickerId) {
                    return stickerOld;
                }
                else {
                    return {
                        ...stickerOld,
                        x: action.x ? action.x : stickerOld.x,
                        y: action.y ? action.y : stickerOld.y,
                        realX: action.realX ? action.realX : stickerOld.realX,
                        realY: action.realY ? action.realY : stickerOld.realY,
                        height: action.height ? action.height : stickerOld.height,
                        width: action.width ? action.width : stickerOld.width,
                    }
                }
            });
        }
        case StickerReducerActions.RESET_REAL_SIZE_AND_COORDS: {
            return state.map(stickerOld => {
                return {
                    ...stickerOld,
                    realX: stickerOld.x,
                    realY: stickerOld.y
                }
            })
        }
    }
}

function lineReducer(state, action) {
    switch (action.type) {
        case LineReducerActions.ADD_LINE: {
            return [...state, action.line];
        }
        case LineReducerActions.REMOVE_LINE: {
            const newLines = state.map(l => { return { ...l } });
            return newLines.filter((l) => l.id !== action.id);
        }
        case LineReducerActions.EDIT_LINE: {
            return state.map(l => {
                let newLine = { ...l };
                if (l.id === action.lineId) {
                    if (action.linePointType === LinePoint.START) {
                        newLine.start.x = action.point.x;
                        newLine.start.y = action.point.y;
                    }
                    else if (action.linePointType === LinePoint.END) {
                        newLine.end.x = action.point.x;
                        newLine.end.y = action.point.y;
                    }
                }
                return newLine;
            });
        }
        case LineReducerActions.CLEAR_LINES: {
            return [];
        }
        case LineReducerActions.SET_LINES: {
            return action.lines;
        }
        case LineReducerActions.HOVER_LINE: {
            return state.map((l) => {
                const newLine = { ...l };
                newLine.hover = l.id === action.id;
                return newLine;
            })
        }
        case LineReducerActions.RESET_HOVER: {
            let anyHover = false;
            const newLines = state.map((l) => {
                anyHover = anyHover || l.hover;
                return { ...l, hover: false };
            });
            return anyHover ? newLines : state;
        }
    }
}

export default function Board({ ref, checkHistory, useGrid, selectedTool, actionHistoryManager }) {
    const GRID_INCREMENT = 25;
    const boardState = useRef(BoardStates.NEURTAL);
    const [stickers, dispatchStickers] = useReducer(stickerReducer, []);
    const [lines, dispatchLines] = useReducer(lineReducer, []);

    const resizingDirection = useRef(null);
    const prevDirection = useRef(null);
    const stickerBeingDragged = useRef(null);
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const drawingStartX = useRef(0);
    const drawingStartY = useRef(0);
    const canvas = useRef(null);
    const hoveringLinePoint = useRef(false);
    const lineBeingEditedId = useRef(null);
    const linePointBeingEditied = useRef(null);
    const resizeAnchorPointX = useRef(null);
    const resizeAnchorPointY = useRef(null);

    const redrawLines = useCallback(() => {
        redraw();
    }, [lines]);

    const updateFile = useCallback(() => {
        const newFile = FileUtil.getFileObject(lines, stickers);
        window.electronAPI.updateFile(newFile);

    }, [lines, stickers]);

    useEffect(() => {
        window.electronAPI.onUpdateFile((defaultFile) => {
            const { newStickers, newLines } = FileUtil.parseFileObject(defaultFile, getLineId, getStickerId);
            dispatchStickers({ type: StickerReducerActions.SET_STICKERS, stickers: newStickers });
            dispatchLines({ type: LineReducerActions.SET_LINES, lines: newLines });
        })

    }, []);

    const LINE_COLOR = "#583101"
    const LINE_COLOR_HOVER = "#b0b0b0"

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

    const drawCircle = (x, y, radius) => {
        const ctx = canvas.current.getContext("2d");
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    const drawLine = (line) => {
        const ctx = canvas.current.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = line.hover ? LINE_COLOR_HOVER : LINE_COLOR;
        ctx.stroke();
    }

    const redraw = () => {
        if (canvas.current) {
            const ctx = canvas.current.getContext("2d");
            ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
            for (let line of lines) {
                drawLine(line);
                if (boardState.current === BoardStates.EDITING_LINE && line.id === lineBeingEditedId.current) {
                    let point = linePointBeingEditied.current === LinePoint.START ? line.start : line.end;
                    drawCircle(point?.x, point?.y, LINE_POINT_EDIT_CIRCLE_RADIUS);
                }
            }
        }
    }

    const backward = () => {
        actionHistoryManager.undo(dispatchLines, dispatchStickers, lines, stickers);
        checkHistory();
    }

    const forward = () => {
        actionHistoryManager.redo(dispatchLines, dispatchStickers, lines, stickers);
        checkHistory();
    }

    const setDrag = (stickerId) => {
        stickerBeingDragged.current = stickerId;
        actionHistoryManager.addToHistory(lines, stickers);
        checkHistory();
        boardState.current = BoardStates.DRAGGING;
    }

    const resizeSticker = (x, y, options = {}) => {
        let sticker = stickers.find(s => s.stickerId === stickerBeingDragged.current);
        if (sticker) {
            if (options.zeroWidth)
                sticker = { ...sticker, width: 0};
            if (options.zeroHeight)
                sticker = { ...sticker, height: 0};
            if (options.resetX)
                sticker = { ...sticker, x: resizeAnchorPointX.current, realX: resizeAnchorPointX.current };
            if (options.resetY)
                sticker = { ...sticker, y: resizeAnchorPointY.current, realY: resizeAnchorPointY.current };

            switch (resizingDirection.current) {
                case Directions.TOP_LEFT: {
                    dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        x: snapToGrid(x),
                        y: snapToGrid(y),
                        realX: snapToGrid(x),
                        realY: snapToGrid(y),
                        width: resizeAnchorPointX.current - snapToGrid(x),
                        height: resizeAnchorPointY.current - snapToGrid(y),
                        stickerId: stickerBeingDragged.current

                    })
                    break;
                }
                case Directions.TOP_RIGHT: {
                    dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        y: snapToGrid(y),
                        realY: snapToGrid(y),
                        width: snapToGrid(x) - sticker.x,
                        height: resizeAnchorPointY.current - snapToGrid(y),
                        stickerId: stickerBeingDragged.current

                    })
                    break;
                }
                case Directions.BOTTOM_LEFT: {
                    dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        x: snapToGrid(x),
                        realX: snapToGrid(x),
                        width: resizeAnchorPointX.current - snapToGrid(x),
                        height: snapToGrid(y) - sticker.y,
                        stickerId: stickerBeingDragged.current

                    })
                    break;
                }
                case Directions.BOTTOM_RIGHT: {
                    dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        width: snapToGrid(x) - sticker.x,
                        height: snapToGrid(y) - sticker.y,
                        stickerId: stickerBeingDragged.current

                    })
                    break;
                }
                case Directions.TOP: {
                    dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        y: snapToGrid(y),
                        realY: snapToGrid(y),
                        height: resizeAnchorPointY.current - snapToGrid(y),
                        stickerId: stickerBeingDragged.current

                    })
                    break;
                }
                case Directions.RIGHT: {
                    dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        width: snapToGrid(x) - sticker.x,
                        stickerId: stickerBeingDragged.current

                    })
                    break;
                }
                case Directions.BOTTOM: {
                    dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        height: snapToGrid(y) - sticker.y,
                        stickerId: stickerBeingDragged.current

                    })
                    break;
                }
                case Directions.LEFT: {
                    dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        x: snapToGrid(x),
                        realX: snapToGrid(x),
                        width: resizeAnchorPointX.current - snapToGrid(x),
                        stickerId: stickerBeingDragged.current

                    })
                    break;
                }
            }
        }
    }

    const mouseUp = (event) => {
        switch (boardState.current) {
            case BoardStates.DRAGGING: {
                boardState.current = BoardStates.NEURTAL;
                dispatchStickers({ type: StickerReducerActions.RESET_REAL_SIZE_AND_COORDS });
                break;
            }
            case BoardStates.EDITING_LINE: {
                boardState.current = BoardStates.NEURTAL;
                lineBeingEditedId.current = null;
                redraw();
                break;
            }
            case BoardStates.DRAWING: {
                const rect = canvas.current.getBoundingClientRect();
                boardState.current = BoardStates.NEURTAL;

                const isDoubleClick = drawingStartX.current === event.clientX - rect.left && drawingStartY.current === event.clientY - rect.top;
                if (!isDoubleClick) {
                    const newLine = {
                        start: {
                            x: snapToGrid(drawingStartX.current),
                            y: snapToGrid(drawingStartY.current)
                        },
                        end: {
                            x: snapToGrid(event.clientX - rect.left),
                            y: snapToGrid(event.clientY - rect.top)
                        },
                        id: getLineId()
                    };
                    actionHistoryManager.addToHistory(lines, stickers);
                    checkHistory();
                    dispatchLines({ type: LineReducerActions.ADD_LINE, line: newLine });
                }
                break;
            }
            case BoardStates.RESIZING_STICKER: {
                boardState.current = BoardStates.NEURTAL;
                dispatchStickers({ type: StickerReducerActions.RESET_REAL_SIZE_AND_COORDS });
                break;
            }
            case BoardStates.CREATE_AND_RESIZE_STICKER: {
                boardState.current = BoardStates.NEURTAL;
                prevDirection.current = null
                break;
            }
            case BoardStates.CREATE_AND_RESIZE_STICKER_PENDING: {
                boardState.current = BoardStates.NEURTAL;
                break;
            }
        }
    }

    const mouseMove = (event) => {
        if (hoveringLinePoint.current) {
            redraw();
            hoveringLinePoint.current = false;
        }

        let moveX = event.clientX - mouseX.current;
        let moveY = event.clientY - mouseY.current;

        mouseX.current = event.clientX;
        mouseY.current = event.clientY;
        if (boardState.current === BoardStates.DRAGGING) {
            const sticker = stickers.find(s => s.stickerId === stickerBeingDragged.current);
            dispatchStickers({
                type: StickerReducerActions.MOVE_STICKER,
                x: snapToGrid(sticker.realX + moveX),
                y: snapToGrid(sticker.realY + moveY),
                realX: sticker.realX + moveX,
                realY: sticker.realY + moveY,
                stickerId: stickerBeingDragged.current
            });
        }
        else if (boardState.current === BoardStates.RESIZING_STICKER) {
            resizeSticker(event.clientX, event.clientY);
        }
        else if (boardState.current === BoardStates.DRAWING) {
            const rect = canvas.current.getBoundingClientRect();
            redraw();
            drawLine({
                start: {
                    x: snapToGrid(drawingStartX.current),
                    y: snapToGrid(drawingStartY.current)
                },
                end: {
                    x: snapToGrid(event.clientX - rect.left),
                    y: snapToGrid(event.clientY - rect.top)
                }
            });
        }
        else if (selectedTool === Tools.ERASER) {
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
        else if (boardState.current === BoardStates.EDITING_LINE) {
            const rect = canvas.current.getBoundingClientRect();
            const point = {
                x: snapToGrid(event.clientX - rect.left),
                y: snapToGrid(event.clientY - rect.top)
            }
            dispatchLines({
                type: LineReducerActions.EDIT_LINE,
                lineId: lineBeingEditedId.current,
                linePointType: linePointBeingEditied.current,
                point: point
            });
        }
        else if (boardState.current === BoardStates.CREATE_AND_RESIZE_STICKER_PENDING) {
            const [crossedThreshold, direction] = DirectionUtil.didMousePassThreshold(
                [resizeAnchorPointX.current, resizeAnchorPointY.current], 
                [event.clientX, event.clientY], 
                MIN_DRAG_TO_CREATE_STICKER
            );
            
            if (crossedThreshold) {
                resizingDirection.current = direction;
                prevDirection.current = direction;
                const {stickerX, stickerY, width, height} = DirectionUtil.getDraggedStickerCoordsFromDirectionAndMouseMovement(
                    [resizeAnchorPointX.current, resizeAnchorPointY.current], 
                    [event.clientX, event.clientY],  direction);

                let newSticker = {
                    stickerId: getStickerId(),
                    x: snapToGrid(stickerX),
                    y: snapToGrid(stickerY),
                    realX: stickerX,
                    realY: stickerY,
                    width: width,
                    height: height,
                };
                stickerBeingDragged.current = newSticker.stickerId;
                actionHistoryManager.addToHistory(lines, stickers);
                checkHistory();
                dispatchStickers({ type: StickerReducerActions.ADD_STICKER, sticker: newSticker });
                boardState.current = BoardStates.CREATE_AND_RESIZE_STICKER;
            }
        }
        else if (boardState.current === BoardStates.CREATE_AND_RESIZE_STICKER) {
            resizingDirection.current = DirectionUtil.getDirectionFromPoints(
                [resizeAnchorPointX.current, resizeAnchorPointY.current],
                [event.clientX, event.clientY]
            );

            let options = {};
            if (resizingDirection.current !== prevDirection.current) {
                options = DirectionUtil.getResizeOptionsFromDirectionChange(prevDirection.current, resizingDirection.current);
                prevDirection.current = resizingDirection.current;
            }
            resizeSticker(event.clientX, event.clientY, options);
        }
        else {
            const rect = canvas.current.getBoundingClientRect();
            const { hovering, lineId, point, linePointType } = CanvisLogicHandler.checkIfLinePointHover(lines, event.clientX - rect.left, event.clientY - rect.top);
            if (hovering) {
                hoveringLinePoint.current = hovering;
                lineBeingEditedId.current = lineId;
                linePointBeingEditied.current = linePointType;
                redraw();
                drawCircle(point.x, point.y, LINE_POINT_HOVER_CIRCLE_RADIUS);
            }
        }
    }

    const mouseDown = (event) => {
        const rect = canvas.current.getBoundingClientRect();
        if (hoveringLinePoint.current) {
            boardState.current = BoardStates.EDITING_LINE;
            actionHistoryManager.addToHistory(lines, stickers);
            checkHistory();
            redraw();
            let point;
            for (let line of lines) {
                if (line.id === lineBeingEditedId.current) {
                    point = linePointBeingEditied.current === LinePoint.START ? line.start : line.end;
                    break;
                }
            }
            drawCircle(point?.x, point?.y, LINE_POINT_EDIT_CIRCLE_RADIUS);
        }
        else if (boardState.current !== BoardStates.DRAWING && selectedTool === Tools.PEN) {
            boardState.current = BoardStates.DRAWING;
            drawingStartX.current = snapToGrid(event.clientX - rect.left);
            drawingStartY.current = snapToGrid(event.clientY - rect.top);
        }
        else if (selectedTool === Tools.STICKER) {
            boardState.current = BoardStates.CREATE_AND_RESIZE_STICKER_PENDING;
            resizeAnchorPointX.current = event.clientX;
            resizeAnchorPointY.current = event.clientY;
        }
    }

    const clear = () => {
        actionHistoryManager.clear();
        checkHistory();
        dispatchLines({ type: LineReducerActions.CLEAR_LINES });
        dispatchStickers({ type: StickerReducerActions.CLEAR_STICKERS });
    }


    const doubleClick = (event) => {
        let newSticker = {
            x: snapToGrid(event.clientX),
            y: snapToGrid(event.clientY),
            realX: event.clientX,
            realY: event.clientY
        };
        actionHistoryManager.addToHistory(lines, stickers);
        checkHistory();
        dispatchStickers({ type: StickerReducerActions.ADD_STICKER, sticker: newSticker });
    }

    const changeText = (text, stickerId) => {
        dispatchStickers({ type: StickerReducerActions.CHANGE_TEXT, text: text, stickerId: stickerId });
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
            dispatchStickers({ type: StickerReducerActions.REMOVE_STICKER, stickerId: stickerId });
        }
    }

    const startResizingSticker = (stickerId, direction, startingX, startingY) => {
        actionHistoryManager.addToHistory(lines, stickers);
        checkHistory();
        stickerBeingDragged.current = stickerId;
        const sticker = stickers.find(s => s.stickerId === stickerId);

        const [anchorX, anchorY] = DirectionUtil.getAnchorPointFromDirection(direction, sticker);
        resizeAnchorPointX.current = anchorX;
        resizeAnchorPointY.current = anchorY;
        boardState.current = BoardStates.RESIZING_STICKER;
        resizingDirection.current = direction;
    }

    redrawLines();
    updateFile();

    return (
        <div onClick={onClick} onDoubleClick={doubleClick} onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseMove={mouseMove} className='board'>
            <canvas height="1000" width="2000" ref={canvas} />
            {stickers.map(sticker =>
                <Sticker key={sticker.stickerId} setDragging={setDrag} stickerId={sticker.stickerId} xCoord={sticker.x} resizeSticker={startResizingSticker} updateTextHistory={updateTextHistory}
                    yCoord={sticker.y} text={sticker.text} setText={changeText} selectedTool={selectedTool} deleteSticker={deleteSticker} width={sticker.width} height={sticker.height} />
            )}
        </div>
    );
}