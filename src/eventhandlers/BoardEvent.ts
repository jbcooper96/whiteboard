import Sticker from '../models/Sticker';
import Line from '../models/Line';

export default class BoardEvent {
    dispatchStickers: Function;
    dispatchLines: Function;
    getBoundingClientRect: Function;
    drawLine: Function;
    drawCircle: Function;
    redraw: Function
    snapToGrid: Function;
    setStickerAttachHoverCoords: Function;
    toBoardCoordsX: Function;
    toBoardCoordsY: Function;
    history: Function;
    canvasCoordsToBoardCoordsX: Function;
    canvasCoordsToBoardCoordsY: Function;
    lines: Line[];
    stickers: Sticker[];
    mouseX: number;
    mouseY: number;
    moveX: number;
    moveY: number;
    stickerAttachHoverCoords: {x: number, y: number, stickerId: number} | undefined;

    constructor(
        dispatchStickers: Function, dispatchLines: Function, getBoundingClientRect: Function, drawLine: Function, drawCircle: Function, 
        redraw: Function, snapToGrid: Function, setStickerAttachHoverCoords: Function, toBoardCoordsX: Function, toBoardCoordsY: Function, 
        history: Function, canvasCoordsToBoardCoordsX: Function, canvasCoordsToBoardCoordsY: Function, lines: Line[], stickers: Sticker[], 
        mouseX: number, mouseY: number, moveX: number, moveY: number, stickerAttachHoverCoords: {x: number, y: number, stickerId: number} 
    ) {
        this.dispatchStickers = dispatchStickers;
        this.dispatchLines = dispatchLines;
        this.drawLine = drawLine;
        this.getBoundingClientRect = getBoundingClientRect;
        this.drawCircle = drawCircle;
        this.redraw = redraw;
        this.snapToGrid = snapToGrid
        this.setStickerAttachHoverCoords = setStickerAttachHoverCoords;
        this.toBoardCoordsX = toBoardCoordsX;
        this.toBoardCoordsY = toBoardCoordsY;
        this.history = history;
        this.canvasCoordsToBoardCoordsX = canvasCoordsToBoardCoordsX;
        this.canvasCoordsToBoardCoordsY = canvasCoordsToBoardCoordsY;
        this.lines = lines;
        this.stickers = stickers;
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        this.moveX = moveX;
        this.moveY = moveY;
        this.stickerAttachHoverCoords = stickerAttachHoverCoords;
    }
}