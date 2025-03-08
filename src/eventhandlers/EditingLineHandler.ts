import EventHandler from './EventHandler';
import BoardEvent from './BoardEvent';
import BoardStates from '../enums/BoardStates';
import CanvisLogicHandler from '../utils/CanvasLogicHandler';
import StickerReducerActions from '../enums/StickerReducerActions';
import Line from '../models/Line'; import Point from '../models/Point';
import getLineId from '../utils/LineIdGenerator';
import LinePoint from '../enums/LinePoint';
import LineReducerActions from '../enums/LineReducerActions';

export default class EditingLineHandler implements EventHandler {
    lineBeingEditiedId: number;
    linePointBeingEdited: LinePoint;

    constructor(lineBeingEditiedId: number, linePointBeingEdited: LinePoint) {
        this.lineBeingEditiedId = lineBeingEditiedId;
        this.linePointBeingEdited = linePointBeingEdited;
    }

    mouseUp(event: BoardEvent): BoardStates {
        if (event.stickerAttachHoverCoords) {
            event.dispatchStickers({
                type: StickerReducerActions.ADD_LINE_CONNECTION,
                stickerId: event.stickerAttachHoverCoords.stickerId,
                x: event.stickerAttachHoverCoords.x,
                y: event.stickerAttachHoverCoords.y,
                lineId: this.lineBeingEditiedId,
                linePoint: this.linePointBeingEdited
            });
            event.dispatchLines({
                type: LineReducerActions.EDIT_LINE,
                lineId: this.lineBeingEditiedId,
                linePointType: this.linePointBeingEdited,
                point: { x: event.stickerAttachHoverCoords.x, y: event.stickerAttachHoverCoords.y }
            });
            event.setStickerAttachHoverCoords(null);
        }
        event.redraw();
        return BoardStates.NEURTAL;
    }

    mouseMove(event: BoardEvent): BoardStates {
        const rect = event.getBoundingClientRect();
        const point = {
            x: event.snapToGrid(event.mouseX - rect.left),
            y: event.snapToGrid(event.mouseY - rect.top)
        }
        event.dispatchLines({
            type: LineReducerActions.EDIT_LINE,
            lineId: this.lineBeingEditiedId,
            linePointType: this.linePointBeingEdited,
            point: point
        });
        const { stickerId, attachPoint } = CanvisLogicHandler.getStickersToAttachTo(event.stickers, event.canvasCoordsToBoardCoordsX(point.x), event.canvasCoordsToBoardCoordsY(point.y));
        if (attachPoint)
            event.setStickerAttachHoverCoords({ stickerId: stickerId, x: attachPoint.x, y: attachPoint.y });
        else
            event.setStickerAttachHoverCoords(null);
        return BoardStates.EDITING_LINE;
    }
}