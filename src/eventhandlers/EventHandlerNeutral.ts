import EventHandler from './EventHandler';
import BoardEvent from './BoardEvent';
import BoardStates from '../enums/BoardStates';

export default class EventHandlerNeutral implements EventHandler {
    mouseMove(event: BoardEvent): BoardStates {
        return BoardStates.NEURTAL;
    }

    mouseUp(event: BoardEvent): BoardStates {
        return BoardStates.NEURTAL;
    }
}