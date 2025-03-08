import EventHandler from './EventHandler';
import BoardEvent from './BoardEvent';
import BoardStates from '../enums/BoardStates';
import Directions from '../enums/Directions';
import resizeSticker from '../utils/ResizeSticker';
import StickerReducerActions from '../enums/StickerReducerActions';

export default class ResizingStickerHandler implements EventHandler {
    resizeAnchorPointX: number;
    resizeAnchorPointY: number;
    resizingDirection: Directions;
    stickerBeingResized: number;

    constructor(resizeAnchorPointX: number, resizeAnchorPointY: number, stickerBeingResized: number, resizingDirection: Directions) {
        this.resizeAnchorPointX = resizeAnchorPointX;
        this.resizeAnchorPointY = resizeAnchorPointY;
        this.stickerBeingResized = stickerBeingResized;
        this.resizingDirection = resizingDirection;
    }

    mouseUp(event: BoardEvent): BoardStates {
        event.dispatchStickers({ type: StickerReducerActions.RESET_REAL_SIZE_AND_COORDS });
        return BoardStates.NEURTAL;
    }

    mouseMove(event: BoardEvent): BoardStates {
        let sticker = event.stickers.find(s => s.stickerId === this.stickerBeingResized);
        if (sticker) {
            resizeSticker(this, event, sticker, event.toBoardCoordsX(event.mouseX), event.toBoardCoordsY(event.mouseY));
        }
        return BoardStates.RESIZING_STICKER;
    }
}