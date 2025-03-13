import Point from './Point';
import LineTypes from '../enums/LineTypes';

export default class Line {
    start: Point;
    end: Point;
    id: number;
    hover: boolean;
    type: LineTypes;

    constructor(id: number, start: Point, end: Point, hover:boolean = false, type:LineTypes = LineTypes.DEFAULT) {
        this.start = start;
        this.end = end;
        this.id = id;
        this.hover = hover;
        this.type = type;
    }
}