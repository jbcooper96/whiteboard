import Point from './Point';

export default class Line {
    start: Point;
    end: Point;
    id: number;
    hover: boolean;

    constructor(id: number, start: Point, end: Point, hover:boolean = false) {
        this.start = start;
        this.end = end;
        this.id = id;
        this.hover = hover;
    }
}