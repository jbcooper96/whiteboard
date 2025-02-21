import LinePoint from '../enums/LinePoint.js'

export default class CanvisLogicHandler {
    static HOVER_RANGE = 15;

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