import LinePoint from '../enums/LinePoint.js'
import Directions from '../enums/Directions.js';

export default class CanvisLogicHandler {
    static HOVER_RANGE = 15;

    static getNewAttachPoint(oldX, oldY, oldWidth, oldHeight, newX, newY, newWidth, newHeight, x, y) {
        const direction = this.#getAttachDirection(oldX, oldY, oldWidth, oldHeight, x, y);

        if (direction == Directions.TOP) {
            x = newX + (x - oldX) * newWidth / oldWidth;
            y = newY;
        }
        else if (direction == Directions.BOTTOM) {
            x = newX + (x - oldX) * newWidth / oldWidth;
            y = newY + newHeight;
        }
        else if (direction == Directions.RIGHT) {
            x = newX + newWidth;
            y = newY + (y - oldY) * newHeight / oldHeight;
        }
        else if (direction == Directions.LEFT) {
            x = newX;
            y = newY + (y - oldY) * newHeight / oldHeight;
        }
        return [x, y];
    }

    static #getAttachDirection(oldX, oldY, oldWidth, oldHeight, x, y)  {
        if (x === oldX) return Directions.LEFT;
        if (x === oldX + oldWidth) return Directions.RIGHT;
        if (y === oldY) return Directions.TOP;
        return Directions.BOTTOM;
    }

    static getStickerAttachPoint(sticker, pointX, pointY) { 
        const { direction } = this.#getDistanceFromSticker(sticker, pointX, pointY);
        return this.#getStickerAttachPointFromStickerAndDirection(sticker, pointX, pointY, direction);
    }

    static getStickersToAttachTo(stickers, pointX, pointY) {
        let minStickerId;
        let minDistance;
        let minAttachPoint;

        for (let sticker of stickers) {
            if (
                (Math.abs(sticker.x - pointX) < sticker.width + this.HOVER_RANGE)
                && (Math.abs(sticker.y - pointY) < sticker.height + this.HOVER_RANGE)
            ) {
                const { distance, direction } = this.#getDistanceFromSticker(sticker, pointX, pointY);
                if (distance < this.HOVER_RANGE && (!minDistance || distance < minDistance)) {
                    minDistance = distance;
                    minStickerId = sticker.stickerId;
                    minAttachPoint = this.#getStickerAttachPointFromStickerAndDirection(sticker, pointX, pointY, direction);
                }
            }
        }
        return {stickerId: minStickerId, attachPoint: minAttachPoint};
    }

    static #getStickerAttachPointFromStickerAndDirection({x, y, width, height}, pointX, pointY, direction) { 
        if (direction === Directions.TOP) {
            return { x: pointX, y: y };
        }
        if (direction === Directions.RIGHT) {
            return { x: x + width, y: pointY };
        }
        if (direction === Directions.BOTTOM) {
            return { x: pointX, y: y + height };
        }
        if (direction === Directions.LEFT) {
            return { x: x, y: pointY };
        }
    }


    static #getDistanceFromSticker({x, y, width, height}, pointX, pointY) {
        const [xCoord1, xCoord2] = [x, x + width];
        const [yCoord1, yCoord2] = [y, y + height];

        let [distanceLeft, distanceRight] = [Math.abs(xCoord1 - pointX), Math.abs(xCoord2 - pointX)];
        let [distanceTop, distanceBot] = [Math.abs(yCoord1 - pointY), Math.abs(yCoord2 - pointY)];

        let distance;
        let minDirection;

        if (xCoord1 <= pointX && pointX <= xCoord2) {
            if (!distance || distanceTop < distance) {
                minDirection = Directions.TOP;
                distance = distanceTop;
            }
            if (!distance || distanceBot < distance) {
                minDirection = Directions.BOTTOM;
                distance = distanceBot;
            }
        }
        if (yCoord1 <= pointY && pointY <= yCoord2) {
            if (!distance || distanceLeft < distance) {
                minDirection = Directions.LEFT;
                distance = distanceLeft;
            }
            if (!distance || distanceRight < distance) {
                minDirection = Directions.RIGHT;
                distance = distanceRight;
            }
        }

        return {distance: distance, direction: minDirection};
    }

    static checkIfLinePointHover(lines, x, y) {
        for (let line of lines) {
            let distance = Math.sqrt(Math.pow(line.start.x - x, 2) + Math.pow(line.start.y - y, 2));
            if (distance < this.HOVER_RANGE) {
                return {
                    lineId: line.id,
                    point: line.start,
                    hovering: true,
                    linePointType: LinePoint.START
                }
            }
            distance = Math.sqrt(Math.pow(line.end.x - x, 2) + Math.pow(line.end.y - y, 2));
            if (distance < this.HOVER_RANGE) {
                return {
                    lineId: line.id,
                    point: line.end,
                    hovering: true,
                    linePointType: LinePoint.END
                }
            }
        }
        return {hovering: false};
    }

    static checkIfLineHover(x, y, line) {
        if (!line.start || !line.end || !x || !y)
            return false;
        return this.#getDistanceFromLine(x, y, line) < this.HOVER_RANGE;
    }

    static #getDistanceFromLine(x, y, line) {
        const lengthX = line.end.x - line.start.x;
        const lengthY = line.end.y - line.start.y
        const lineLengthSquared = Math.pow(lengthY, 2) + Math.pow(lengthX, 2);
        const t = this.#getT(x, y, line, lineLengthSquared, lengthX, lengthY)

        if (t < 0) {
            const distanceFromStart = Math.sqrt(Math.pow(x - line.start.x, 2) + Math.pow(y - line.start.y, 2));
            return distanceFromStart;
        }
        else if (t > 1) {
            const distanceFromEnd = Math.sqrt(Math.pow(x - line.end.x, 2) + Math.pow(y - line.end.y, 2));
            return distanceFromEnd;
        }
        else {
            const lengthXTimesPoint = lengthX * y;
            const lengthYTimesPoint = lengthY * x;
            const numerator = Math.abs(lengthYTimesPoint - lengthXTimesPoint + line.end.x * line.start.y - line.end.y * line.start.x);
            const denominator = Math.sqrt(lineLengthSquared);
            return numerator / denominator;
        }
        
    }

    static #getT(x, y, line, lineLengthSquared, lengthX, lengthY) {
        return ((x - line.start.x) * lengthX + (y - line.start.y) * lengthY) / lineLengthSquared;
    }
}