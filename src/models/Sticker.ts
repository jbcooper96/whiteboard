import { StickerTypes } from "../enums/StickerTypes"

export default class Sticker {
    type: StickerTypes;
    stickerId: number;
    x: number;
    y: number;
    realX: number;
    realY: number;
    width: number;
    height: number;
    
    constructor (stickerId: number, x: number, y: number, realX: number, realY: number, width: number, height: number, type:StickerTypes = StickerTypes.DEFAULT) {
        this.stickerId = stickerId;
        this.x = x;
        this.y = y;
        this.realX = realX;
        this.realY = realY;
        this.width = width;
        this.height = height;
        this.type = type;
    }
}