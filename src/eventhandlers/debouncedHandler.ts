import EventHandler from './EventHandler';
import BoardEvent from './BoardEvent';
import BoardStates from '../enums/BoardStates';

const DEFAULT_THRESHOLD = 20

export default class DebouncedHandler implements EventHandler {
    lastResize: number;
    timeout: number | undefined;
    handler: EventHandler;
    threshold: number;
    moveState: BoardStates;
    doneState: BoardStates;

    constructor(handler: EventHandler, moveState: BoardStates, doneState: BoardStates=BoardStates.NEURTAL, threshold: number = DEFAULT_THRESHOLD) {
        this.lastResize = Date.now();
        this.handler = handler;
        this.threshold = threshold;
        this.moveState = moveState;
        this.doneState = doneState;
    }

    mouseUp(event: BoardEvent): BoardStates {
        setTimeout(() => this.handler.mouseUp(event), this.threshold);
        return this.doneState;
    }

    mouseMove(event: BoardEvent): BoardStates {
        if (this.timeout)
            clearTimeout(this.timeout);
        if (Date.now() > (this.lastResize - this.threshold)) 
            this.handler.mouseMove(event);
        else 
            this.timeout = setTimeout(() => this.handler.mouseMove(event), this.threshold);
        return this.moveState;
    }
}