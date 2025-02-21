import BoardStates from "../enums/BoardStates";
import StickerReducerActions from "../enums/StickerReducerActions";
import LineReducerActions from "../enums/LineReducerActions";

class DraggingEventHandler {
    constructor(dispatchStickers, dispatchLines, redraw, snapToGrid, clientX, clientY, stickerId) {
        this.dispatchStickers = dispatchStickers;
        this.dispatchLines = dispatchLines;
        this.redraw = redraw;
        this.snapToGrid = snapToGrid;
        this.lastMouse = {x: clientX, y: clientY};
        this.stickerId = stickerId;
    }

    handleMouseMove(event, stickers, lines) {
        const sticker = stickers.find(s => s.stickerId === this.stickerId);
        const moveX = event.clientX - this.lastMouse.x;
        const moveY = event.clientY - this.lastMouse.y;
        this.lastMouse = {x: event.clientX, y: event.clientY};

        this.dispatchStickers({
            type: StickerReducerActions.MOVE_STICKER,
            x: this.snapToGrid(sticker.realX + moveX),
            y: this.snapToGrid(sticker.realY + moveY),
            realX: sticker.realX + moveX,
            realY: sticker.realY + moveY,
            stickerId: this.stickerId
        });
    }
}

class DrawingEventHandler {
    constructor(dispatchStickers, dispatchLines, redraw, snapToGrid, clientX, clientY) {
        
    }
}