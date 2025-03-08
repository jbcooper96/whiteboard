import ResizeStickerOptions from '../models/ResizeStickerOptions';
import BoardEvent from '../eventhandlers/BoardEvent';
import ResizingStickerHandler from '../eventhandlers/ResizingStickerHandler';
import CreateAndResizeStickerHandler from '../eventhandlers/CreateAndResizeStickerHandler';
import StickerReducerActions from '../enums/StickerReducerActions';
import Sticker from '../models/Sticker';
import Directions from '../enums/Directions';

export default function resizeSticker(handler: ResizingStickerHandler | CreateAndResizeStickerHandler, event: BoardEvent, sticker: Sticker, x: number, y: number, options: ResizeStickerOptions = {}) {
        if (sticker) {
            if (options.zeroWidth)
                sticker = { ...sticker, width: 0};
            if (options.zeroHeight)
                sticker = { ...sticker, height: 0};
            if (options.resetX)
                sticker = { ...sticker, x: handler.resizeAnchorPointX, realX: handler.resizeAnchorPointX };
            if (options.resetY)
                sticker = { ...sticker, y: handler.resizeAnchorPointY, realY: handler.resizeAnchorPointY };

            switch (handler.resizingDirection) {
                case Directions.TOP_LEFT: {
                    event.dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        x: event.snapToGrid(x),
                        y: event.snapToGrid(y),
                        realX: event.snapToGrid(x),
                        realY: event.snapToGrid(y),
                        width: handler.resizeAnchorPointX - event.snapToGrid(x),
                        height: handler.resizeAnchorPointY - event.snapToGrid(y),
                        stickerId: handler.stickerBeingResized
                    })
                    break;
                }
                case Directions.TOP_RIGHT: {
                    event.dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        y: event.snapToGrid(y),
                        realY: event.snapToGrid(y),
                        width: event.snapToGrid(x) - sticker.x,
                        height: handler.resizeAnchorPointY - event.snapToGrid(y),
                        stickerId: handler.stickerBeingResized

                    })
                    break;
                }
                case Directions.BOTTOM_LEFT: {
                    event.dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        x: event.snapToGrid(x),
                        realX: event.snapToGrid(x),
                        width: handler.resizeAnchorPointX - event.snapToGrid(x),
                        height: event.snapToGrid(y) - sticker.y,
                        stickerId: handler.stickerBeingResized

                    })
                    break;
                }
                case Directions.BOTTOM_RIGHT: {
                    event.dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        width: event.snapToGrid(x) - sticker.x,
                        height: event.snapToGrid(y) - sticker.y,
                        stickerId: handler.stickerBeingResized
                    })
                    break;
                }
                case Directions.TOP: {
                    event.dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        y: event.snapToGrid(y),
                        realY: event.snapToGrid(y),
                        height: handler.resizeAnchorPointY - event.snapToGrid(y),
                        stickerId: handler.stickerBeingResized
                    })
                    break;
                }
                case Directions.RIGHT: {
                    event.dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        width: event.snapToGrid(x) - sticker.x,
                        stickerId: handler.stickerBeingResized
                    })
                    break;
                }
                case Directions.BOTTOM: {
                    event.dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        height: event.snapToGrid(y) - sticker.y,
                        stickerId: handler.stickerBeingResized
                    })
                    break;
                }
                case Directions.LEFT: {
                    event.dispatchStickers({
                        type: StickerReducerActions.RESIZE_STICKER,
                        x: event.snapToGrid(x),
                        realX: event.snapToGrid(x),
                        width: handler.resizeAnchorPointX - event.snapToGrid(x),
                        stickerId: handler.stickerBeingResized
                    })
                    break;
                }
            }
        }
    }