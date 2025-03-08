import EventHandler from './EventHandler';
import BoardEvent from './BoardEvent';
import BoardStates from '../enums/BoardStates';
import CanvisLogicHandler from '../utils/CanvasLogicHandler';
import StickerReducerActions from '../enums/StickerReducerActions';
import Line from '../models/Line';
import Point from '../models/Point';
import getLineId from '../utils/LineIdGenerator';
import LinePoint from '../enums/LinePoint';
import LineReducerActions from '../enums/LineReducerActions';

export default class DrawingHandler implements EventHandler {
    drawingStartX: number;
    drawingStartY: number;
    drawingStartIsAttachedToSticker: boolean | undefined;
    drawingStartAttachedSticker: number | undefined;


    constructor(drawingStartX: number, drawingStartY: number, drawingStartAttachedSticker?: number | undefined, drawingStartIsAttachedToSticker?:boolean) {
        this.drawingStartX = drawingStartX;
        this.drawingStartY = drawingStartY;
        this.drawingStartAttachedSticker = drawingStartAttachedSticker;
        this.drawingStartIsAttachedToSticker = drawingStartIsAttachedToSticker;
    }

    mouseUp(event: BoardEvent): BoardStates {
        const rect = event.getBoundingClientRect();

        const isDoubleClick = this.drawingStartX === event.mouseX - rect.left && this.drawingStartY === event.mouseY - rect.top;
        if (!isDoubleClick) {
            event.history();
            const newLine = new Line(
                getLineId(),
                new Point(
                    this.drawingStartX,
                    this.drawingStartY
                ),
                new Point(
                    event.snapToGrid(event.mouseX - rect.left),
                    event.snapToGrid(event.mouseY - rect.top)
                )
            );
            if (newLine.start.x === newLine.end.x && newLine.start.x === newLine.end.x)
                return BoardStates.NEURTAL;


            //attach start of line
            if (this.drawingStartIsAttachedToSticker) {
                event.dispatchStickers({
                    type: StickerReducerActions.ADD_LINE_CONNECTION,
                    stickerId: this.drawingStartAttachedSticker,
                    x: newLine.start.x,
                    y: newLine.start.y,
                    lineId: newLine.id,
                    linePoint: LinePoint.START
                });
            }

            //attach end of line
            if (event.stickerAttachHoverCoords) {
                if (event.stickerAttachHoverCoords.stickerId !== this.drawingStartAttachedSticker) {
                    event.dispatchStickers({
                        type: StickerReducerActions.ADD_LINE_CONNECTION,
                        stickerId: event.stickerAttachHoverCoords.stickerId,
                        x: event.stickerAttachHoverCoords.x,
                        y: event.stickerAttachHoverCoords.y,
                        lineId: newLine.id,
                        linePoint: LinePoint.END
                    });
                    newLine.end.x = event.stickerAttachHoverCoords.x;
                    newLine.end.y = event.stickerAttachHoverCoords.y;
                }
                event.setStickerAttachHoverCoords(null);
            }

            event.dispatchLines({ type: LineReducerActions.ADD_LINE, line: newLine });
        }
        return BoardStates.NEURTAL;
    }

    mouseMove(event: BoardEvent): BoardStates {
        const rect = event.getBoundingClientRect();
        event.redraw();
        event.drawLine({
            start: {
                x: event.snapToGrid(this.drawingStartX),
                y: event.snapToGrid(this.drawingStartY)
            },
            end: {
                x: event.snapToGrid(event.mouseX - rect.left),
                y: event.snapToGrid(event.mouseY - rect.top)
            }
        });
        const { stickerId, attachPoint } = CanvisLogicHandler.getStickersToAttachTo(event.stickers, event.toBoardCoordsX(event.mouseX), event.toBoardCoordsY(event.mouseY));
        if (attachPoint) {
            event.setStickerAttachHoverCoords({ stickerId: stickerId, x: attachPoint.x, y: attachPoint.y });
        }
        else {
            event.setStickerAttachHoverCoords(null);
        }
        return BoardStates.DRAWING;
    }
}