import Directions from '../enums/Directions.js';

export default class DirectionUtil {
    static getDirectionFromPoints([startX, startY], [endX, endY]) {
        let [left, up] = [true, true];
        if (endX > startX) left = false;
        if (endY > startY) up = false;

        if (up && left) return Directions.TOP_LEFT;
        else if (up && !left) return Directions.TOP_RIGHT;
        else if (!up && left) return Directions.BOTTOM_LEFT;
        else return Directions.BOTTOM_RIGHT;
    }

    static getLeftAndRightFromDirection(direction) {
        switch (direction) {
            case Directions.BOTTOM_LEFT:
                return [true, false];
            case Directions.BOTTOM_RIGHT:
                return [false, false];
            case Directions.TOP_LEFT:
                return [true, false];
            case Directions.TOP_RIGHT:
                return [false, true];
            default:
                return null;
        }
    }

    static getResizeOptionsFromDirectionChange(startDirection, endDirection) {
        const [startLeft, startUp] = DirectionUtil.getLeftAndRightFromDirection(startDirection);
        const [endLeft, endUp] = DirectionUtil.getLeftAndRightFromDirection(endDirection);

        return {
            zeroWidth: startLeft !== endLeft && endLeft,
            resetX: startLeft !== endLeft && !endLeft,
            zeroHeight: startUp !== endUp && endUp,
            resetY: startUp !== endUp && !endUp
        }
    }

    static getAnchorPointFromDirection(direction, sticker) {
        switch (direction) {
            case Directions.BOTTOM_LEFT:
                return [sticker.x + sticker.width, sticker.y]
            case Directions.BOTTOM_RIGHT:
                return [sticker.x, sticker.y];
            case Directions.TOP_LEFT:
                return [sticker.x + sticker.width, sticker.y + sticker.height];
            case Directions.TOP_RIGHT:
                return [sticker.x, sticker.y + sticker.height];
            case Directions.TOP:
                return [null, sticker.y + sticker.height];
            case Directions.RIGHT:
                return [sticker.x, null];
            case Directions.BOTTOM:
                return [null, sticker.y];
            case Directions.LEFT:
                return [sticker.x + sticker.width, null];
            default:
                return null;
        }
    }

    static didMousePassThreshold([startX, startY], [endX, endY], threshold) {
        let brokeThreshold = endX - startX < -threshold || endX- startX  > threshold;
        brokeThreshold = brokeThreshold && (endY - startY < -threshold || endY - startY > threshold);
        return [brokeThreshold, DirectionUtil.getDirectionFromPoints([startX, startY], [endX, endY])];
    }

    static getDraggedStickerCoordsFromDirectionAndMouseMovement([startX, startY], [endX, endY], direction) {
        switch (direction) {
            case Directions.BOTTOM_LEFT:
                return {stickerX: endX, stickerY: startY, width: startX - endX, height: endY - startY};
            case Directions.BOTTOM_RIGHT:
                return {stickerX: startX, stickerY: startY, width: endX - startX, height: endY - startY};
            case Directions.TOP_LEFT:
                return {stickerX: endX, stickerY: endY, width: startX - endX, height: startY - endY};
            case Directions.TOP_RIGHT:
                return {stickerX: startX, stickerY: endY, width: endX - startX, height: startY - endY};
            default:
                return null;
        }
    }
}