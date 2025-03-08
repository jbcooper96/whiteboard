import EventHandler from './EventHandler';
import BoardEvent from './BoardEvent';
import BoardStates from '../enums/BoardStates';
import StickerReducerActions from '../enums/StickerReducerActions';

export default class DraggingHandler implements EventHandler {
    stickerBeingDragged: number;

    constructor(stickerBeingDrragged: number) {
        this.stickerBeingDragged = stickerBeingDrragged;
    }

    mouseUp(event: BoardEvent): BoardStates {
        if (event.dispatchStickers) {
            event.dispatchStickers({ type: StickerReducerActions.RESET_REAL_SIZE_AND_COORDS });
        }
            
        return BoardStates.NEURTAL;
    }

    mouseMove(event: BoardEvent): BoardStates {
        const sticker = event.stickers.find(s => s.stickerId === this.stickerBeingDragged);
        if (event.dispatchStickers && sticker) {
            event.dispatchStickers({
                type: StickerReducerActions.MOVE_STICKER,
                x: event.snapToGrid ? event.snapToGrid(sticker.realX + event.moveX) : sticker.realX + event.moveX,
                y: event.snapToGrid ? event.snapToGrid(sticker.realY + event.moveY) : sticker.realY + event.moveY,
                realX: sticker.realX + event.moveX,
                realY: sticker.realY + event.moveY,
                stickerId: this.stickerBeingDragged
            });
        }
        
        return BoardStates.DRAGGING;
    }
}