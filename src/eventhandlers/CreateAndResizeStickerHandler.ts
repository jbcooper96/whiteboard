import EventHandler from './EventHandler';
import BoardEvent from './BoardEvent';
import BoardStates from '../enums/BoardStates';
import Directions from '../enums/Directions';
import DirectionUtil from '../utils/DirectionUtil';
import StickerReducerActions from '../enums/StickerReducerActions';
import Sticker from '../models/Sticker';
import getStickerId from '../utils/StickerIdGenerator';
import { StickerTypes } from '../enums/StickerTypes';
import resizeSticker from '../utils/ResizeSticker';

const MIN_DRAG_TO_CREATE_STICKER = 20;

export default class CreateAndResizeStickerHandler implements EventHandler {
    resizeAnchorPointX: number;
    resizeAnchorPointY: number;
    resizingDirection: Directions | undefined;
    prevDirection: Directions | undefined;
    stickerBeingResized: number | undefined;
    crossedThreshold: boolean = false;

    constructor(resizeAnchorPointX: number, resizeAnchorPointY: number) {
        this.resizeAnchorPointX = resizeAnchorPointX;
        this.resizeAnchorPointY = resizeAnchorPointY;
    }
    mouseUp(event: BoardEvent): BoardStates {
        return BoardStates.NEURTAL;
    }

    mouseMove(event: BoardEvent): BoardStates {
        if (this.crossedThreshold) {
            let sticker = event.stickers.find(s => s.stickerId === this.stickerBeingResized);
            if (sticker) {
                this.resizingDirection = DirectionUtil.getDirectionFromPoints(
                    [this.resizeAnchorPointX, this.resizeAnchorPointY],
                    [event.mouseX, event.mouseY]
                );
    
                let options = {};
                if (this.resizingDirection !== this.prevDirection) {
                    options = DirectionUtil.getResizeOptionsFromDirectionChange(this.prevDirection, this.resizingDirection);
                    this.prevDirection = this.resizingDirection;
                }
                resizeSticker(this, event, sticker, event.mouseX, event.mouseY, options);
            }
        }
        else {
            const [crossedThreshold, direction] = DirectionUtil.didMousePassThreshold(
                [this.resizeAnchorPointX, this.resizeAnchorPointY],
                [event.mouseX, event.mouseX],
                MIN_DRAG_TO_CREATE_STICKER
            );

            if (crossedThreshold) {
                this.crossedThreshold = true;
                this.resizingDirection = direction;
                this.prevDirection = direction;
                const options = DirectionUtil.getDraggedStickerCoordsFromDirectionAndMouseMovement(
                    [this.resizeAnchorPointX, this.resizeAnchorPointY],
                    [event.mouseX, event.mouseY], direction);

                if (options) {
                    let newSticker = new Sticker(
                        getStickerId(),
                        event.snapToGrid(event.toBoardCoordsX(options.stickerX)),
                        event.snapToGrid(event.toBoardCoordsY(options.stickerY)),
                        event.toBoardCoordsX(options.stickerX),
                        event.toBoardCoordsY(options.stickerY),
                        options.width,
                        options.height,
                        event.stickerType
                    );
                    this.stickerBeingResized = newSticker.stickerId;
                    event.history();
                    event.dispatchStickers({ type: StickerReducerActions.ADD_STICKER, sticker: newSticker });
                }

            }
        }

        return BoardStates.CREATE_AND_RESIZE_STICKER;
    }
}