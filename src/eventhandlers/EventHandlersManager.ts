import EventHandler from './EventHandler';
import EventHandlerNeutral from './EventHandlerNeutral';
import BoardEvent from './BoardEvent';
import BoardStates from '../enums/BoardStates';
import Directions from '../enums/Directions';
import CreateAndResizeStickerHandler from './CreateAndResizeStickerHandler';
import ResizingStickerHandler from './ResizingStickerHandler';
import EditingLineHandler from './EditingLineHandler';
import LinePoint from '../enums/LinePoint';
import DrawingHandler from './DrawingHandler';
import DraggingHandler from './DraggingHandler';


export default class EventHandlersManager {
    eventHandler: EventHandler;

    constructor() {
        this.eventHandler = new EventHandlerNeutral();
    }

    mouseMove(event: BoardEvent): BoardStates {
        let newState = this.eventHandler.mouseMove(event);
        if (newState === BoardStates.NEURTAL) {
            this.eventHandler = new EventHandlerNeutral();
        }
        return newState;
    }

    mouseUp(event: BoardEvent): BoardStates {
        let newState = this.eventHandler.mouseUp(event);
        if (newState === BoardStates.NEURTAL) {
            this.eventHandler = new EventHandlerNeutral();
        }
        return newState;
    }

    createAndResizeSticker(resizeAnchorPointX: number, resizeAnchorPointY: number) {
        this.eventHandler = new CreateAndResizeStickerHandler(resizeAnchorPointX, resizeAnchorPointY);
    }

    resizeSticker(resizeAnchorPointX: number, resizeAnchorPointY: number, stickerBeingResized: number, resizingDirection: Directions) {
        this.eventHandler = new ResizingStickerHandler(resizeAnchorPointX, resizeAnchorPointY, stickerBeingResized, resizingDirection);
    }

    editLine(lineBeingEditiedId: number, linePointBeingEdited: LinePoint) {
        this.eventHandler = new EditingLineHandler(lineBeingEditiedId, linePointBeingEdited);
    }

    startDrawing(drawingStartX: number, drawingStartY: number, drawingStartAttachedSticker?: number | undefined, drawingStartIsAttachedToSticker?:boolean) {
        this.eventHandler = new DrawingHandler(drawingStartX, drawingStartY, drawingStartAttachedSticker, drawingStartIsAttachedToSticker);
    }

    startDragging(stickerBeingDrragged: number) {
        this.eventHandler = new DraggingHandler(stickerBeingDrragged);
    }
}