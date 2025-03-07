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
import StickerTypes from '../enums/StickerTypes.js';
import Canvas from './Canvas.jsx';
import getLineId from "../utils/LineIdGenerator.js";
import stickerReducer from '../reducers/StickerReducer.js';
import lineReducer from '../reducers/LineReducer.js';
import getStickerId from '../utils/StickerIdGenerator.js';

const LINE_POINT_HOVER_CIRCLE_RADIUS = 4;
const LINE_POINT_EDIT_CIRCLE_RADIUS = 6;

const MIN_DRAG_TO_CREATE_STICKER = 20;

export default function Board({ ref, checkHistory, useGrid, selectedTool, actionHistoryManager, stickerType }) {
    const GRID_INCREMENT = 25;
    const boardState = useRef(BoardStates.NEURTAL);
    const [stickers, dispatchStickers] = useReducer(stickerReducer, []);
    const [lines, dispatchLines] = useReducer(lineReducer, []);
    const [stickerAttachHoverCoords, setStickerAttachHoverCoords] = useState(null);

    const resizingDirection = useRef(null);
    const prevDirection = useRef(null);
    const stickerBeingDragged = useRef(null);
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const drawingStartX = useRef(0);
    const drawingStartY = useRef(0);
    const drawingStartIsAttachedToSticker = useRef(false);
    const drawingStartAttachedSticker = useRef(null);
    const canvas = useRef(null);
    const hoveringLinePoint = useRef(false);
    const lineBeingEditedId = useRef(null);
    const linePointBeingEditied = useRef(null);
    const resizeAnchorPointX = useRef(null);
    const resizeAnchorPointY = useRef(null);
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
                    dispatchStickerWrapper({
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
                    dispatchStickerWrapper({
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
                    dispatchStickerWrapper({
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
                    dispatchStickerWrapper({
                        type: StickerReducerActions.RESIZE_STICKER,
                        width: snapToGrid(x) - sticker.x,
                        height: snapToGrid(y) - sticker.y,
                        stickerId: stickerBeingDragged.current
                    })
                    break;
                }
                case Directions.TOP: {
                    dispatchStickerWrapper({
                        type: StickerReducerActions.RESIZE_STICKER,
                        y: snapToGrid(y),
                        realY: snapToGrid(y),
                        height: resizeAnchorPointY.current - snapToGrid(y),
                        stickerId: stickerBeingDragged.current
                    })
                    break;
                }
                case Directions.RIGHT: {
                    dispatchStickerWrapper({
                        type: StickerReducerActions.RESIZE_STICKER,
                        width: snapToGrid(x) - sticker.x,
                        stickerId: stickerBeingDragged.current
                    })
                    break;
                }
                case Directions.BOTTOM: {
                    dispatchStickerWrapper({
                        type: StickerReducerActions.RESIZE_STICKER,
                        height: snapToGrid(y) - sticker.y,
                        stickerId: stickerBeingDragged.current
                    })
                    break;
                }
                case Directions.LEFT: {
                    dispatchStickerWrapper({
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

    const addLinePointToSticker = (stickerId, connectionX, connectionY, lineId, linePoint) => {
        dispatchStickerWrapper({
            type: StickerReducerActions.ADD_LINE_CONNECTION,
            stickerId: stickerId,
            x: connectionX,
            y: connectionY,
            lineId: lineId,
            linePoint: linePoint
        });
        dispatchLines({
            type: LineReducerActions.EDIT_LINE,
            lineId: lineId,
            linePointType: linePoint,
            point: {x: connectionX, y: connectionY}
        })
    }

    const mouseUp = (event) => {
        switch (boardState.current) {
            case BoardStates.DRAGGING: {
                boardState.current = BoardStates.NEURTAL;
                dispatchStickerWrapper({ type: StickerReducerActions.RESET_REAL_SIZE_AND_COORDS });
                break;
            }
            case BoardStates.EDITING_LINE: {
                boardState.current = BoardStates.NEURTAL;
                
                if (stickerAttachHoverCoords) {
                    addLinePointToSticker(
                        stickerAttachHoverCoords.stickerId, 
                        stickerAttachHoverCoords.x, 
                        stickerAttachHoverCoords.y, 
                        lineBeingEditedId.current, 
                        linePointBeingEditied.current
                    );
                    setStickerAttachHoverCoords(null);
                }
                lineBeingEditedId.current = null;
                canvas.current.redraw();
                break;
            }
            case BoardStates.DRAWING: {
                const rect = canvas.current.getBoundingClientRect();
                boardState.current = BoardStates.NEURTAL;

                const isDoubleClick = drawingStartX.current === event.clientX - rect.left && drawingStartY.current === event.clientY - rect.top;
                if (!isDoubleClick) {
                    const newLine = {
                        start: {
                            x: drawingStartX.current,
                            y: drawingStartY.current
                        },
                        end: {
                            x: snapToGrid(event.clientX - rect.left),
                            y: snapToGrid(event.clientY - rect.top)
                        },
                        id: getLineId()
                    };
                    if (newLine.start.x === newLine.end.x && newLine.start.x === newLine.end.x)
                        return;

                    actionHistoryManager.addToHistory(lines, stickers);
                    checkHistory();

                    //attach start of line
                    if (drawingStartIsAttachedToSticker.current) {
                        dispatchStickerWrapper({
                            type: StickerReducerActions.ADD_LINE_CONNECTION,
                            stickerId: drawingStartAttachedSticker.current,
                            x: newLine.start.x,
                            y: newLine.start.y,
                            lineId: newLine.id,
                            linePoint: LinePoint.START
                        });
                    }

                    //attach end of line
                    if (stickerAttachHoverCoords) {
                        if (stickerAttachHoverCoords.stickerId !== drawingStartAttachedSticker.current) {
                            dispatchStickerWrapper({
                                type: StickerReducerActions.ADD_LINE_CONNECTION,
                                stickerId: stickerAttachHoverCoords.stickerId,
                                x: stickerAttachHoverCoords.x,
                                y: stickerAttachHoverCoords.y,
                                lineId: newLine.id,
                                linePoint: LinePoint.END
                            });
                            newLine.end.x = stickerAttachHoverCoords.x;
                            newLine.end.y = stickerAttachHoverCoords.y;
                        }
                        setStickerAttachHoverCoords(null);
                    }
                    
                    dispatchLines({ type: LineReducerActions.ADD_LINE, line: newLine });
                }
                break;
            }
            case BoardStates.RESIZING_STICKER: {
                boardState.current = BoardStates.NEURTAL;
                dispatchStickerWrapper({ type: StickerReducerActions.RESET_REAL_SIZE_AND_COORDS });
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
            canvas.current.redraw();
            hoveringLinePoint.current = false;
        }

        let moveX = event.clientX - mouseX.current;
        let moveY = event.clientY - mouseY.current;

        mouseX.current = event.clientX;
        mouseY.current = event.clientY;
        if (boardState.current === BoardStates.DRAGGING) {
            const sticker = stickers.find(s => s.stickerId === stickerBeingDragged.current);
            dispatchStickerWrapper({
                type: StickerReducerActions.MOVE_STICKER,
                x: snapToGrid(sticker.realX + moveX),
                y: snapToGrid(sticker.realY + moveY),
                realX: sticker.realX + moveX,
                realY: sticker.realY + moveY,
                stickerId: stickerBeingDragged.current
            });
        }
        else if (boardState.current === BoardStates.RESIZING_STICKER) {
            resizeSticker(toBoardCoordsX(event.clientX), toBoardCoordsY(event.clientY));
        }
        else if (boardState.current === BoardStates.DRAWING) {
            const rect = canvas.current.getBoundingClientRect();
            canvas.current.redraw();
            canvas.current.drawLine({
                start: {
                    x: snapToGrid(drawingStartX.current),
                    y: snapToGrid(drawingStartY.current)
                },
                end: {
                    x: snapToGrid(event.clientX - rect.left),
                    y: snapToGrid(event.clientY - rect.top)
                }
            });
            const { stickerId, attachPoint } = CanvisLogicHandler.getStickersToAttachTo(stickers, toBoardCoordsX(event.clientX), toBoardCoordsY(event.clientY));
            if (attachPoint)
                setStickerAttachHoverCoords({stickerId: stickerId, x: attachPoint.x, y: attachPoint.y});
            else 
                setStickerAttachHoverCoords(null);
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
            const { stickerId, attachPoint } = CanvisLogicHandler.getStickersToAttachTo(stickers, canvasCoordsToBoardCoordsX(point.x), canvasCoordsToBoardCoordsY(point.y));
            if (attachPoint)
                setStickerAttachHoverCoords({stickerId: stickerId, x: attachPoint.x, y: attachPoint.y});
            else 
                setStickerAttachHoverCoords(null);
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
                    x: snapToGrid(toBoardCoordsX(stickerX)),
                    y: snapToGrid(toBoardCoordsY(stickerY)),
                    realX: toBoardCoordsX(stickerX),
                    realY: toBoardCoordsY(stickerY),
                    width: width,
                    height: height,
                    type: stickerType
                };
                stickerBeingDragged.current = newSticker.stickerId;
                actionHistoryManager.addToHistory(lines, stickers);
                checkHistory();
                dispatchStickerWrapper({ type: StickerReducerActions.ADD_STICKER, sticker: newSticker });
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
                canvas.current.redraw();
                canvas.current.drawCircle(point.x, point.y, LINE_POINT_HOVER_CIRCLE_RADIUS);
            }
        }
    }

    const mouseDown = (event) => {
        const rect = canvas.current.getBoundingClientRect();
        if (hoveringLinePoint.current) {
            boardState.current = BoardStates.EDITING_LINE;
            actionHistoryManager.addToHistory(lines, stickers);
            checkHistory();
            canvas.current.redraw();
            let point;
            for (let line of lines) {
                if (line.id === lineBeingEditedId.current) {
                    point = linePointBeingEditied.current === LinePoint.START ? line.start : line.end;
                    break;
                }
            }
            canvas.current.drawCircle(point?.x, point?.y, LINE_POINT_EDIT_CIRCLE_RADIUS);
        }
        else if (boardState.current !== BoardStates.DRAWING && selectedTool === Tools.PEN) {
            boardState.current = BoardStates.DRAWING;
            const xCanvasCoord = event.clientX - rect.left;
            const yCanvasCoord = event.clientY - rect.top;
            drawingStartX.current = snapToGrid(xCanvasCoord);
            drawingStartY.current = snapToGrid(yCanvasCoord);
            const { stickerId, attachPoint } = CanvisLogicHandler.getStickersToAttachTo(stickers, canvasCoordsToBoardCoordsX(xCanvasCoord), canvasCoordsToBoardCoordsX(yCanvasCoord));
            drawingStartIsAttachedToSticker.current = !!attachPoint;
            if (attachPoint) {
                drawingStartAttachedSticker.current = stickerId;
                drawingStartX.current = attachPoint.x;
                drawingStartY.current = attachPoint.y;
            }
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
        stickerBeingDragged.current = stickerId;
        const sticker = stickers.find(s => s.stickerId === stickerId);

        const [anchorX, anchorY] = DirectionUtil.getAnchorPointFromDirection(direction, sticker);
        resizeAnchorPointX.current = anchorX;
        resizeAnchorPointY.current = anchorY;
        boardState.current = BoardStates.RESIZING_STICKER;
        resizingDirection.current = direction;
    }

    const getShouldShowStickerAttachHover = (stickerId) => {
        return stickerAttachHoverCoords && stickerAttachHoverCoords.stickerId === stickerId 
            && (!drawingStartIsAttachedToSticker.current || stickerAttachHoverCoords.stickerId !== drawingStartAttachedSticker.current);
    }

    updateFile();

    return (
        <div ref={board} onClick={onClick} onDoubleClick={doubleClick} onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseMove={mouseMove} className='board'>
            <Canvas ref={canvas} lines={lines} boardState={boardState} linePointBeingEditied={linePointBeingEditied} lineBeingEditedId={lineBeingEditedId}/>
            {stickers.map(sticker =>
                <Sticker key={sticker.stickerId} setDragging={setDrag} stickerId={sticker.stickerId} xCoord={sticker.x} resizeSticker={startResizingSticker} updateTextHistory={updateTextHistory}
                    yCoord={sticker.y} text={sticker.text} setText={changeText} selectedTool={selectedTool} deleteSticker={deleteSticker} width={sticker.width} height={sticker.height} 
                    type={sticker.type} showAttachHover={getShouldShowStickerAttachHover(sticker.stickerId)} stickerAttachHoverCoords={stickerAttachHoverCoords}/>
            )}
        </div>
    );
}