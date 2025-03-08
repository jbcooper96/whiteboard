import BoardStates from "../enums/BoardStates";
import BoardEvent from "./BoardEvent";

export default interface EventHandler {
    mouseUp(event: BoardEvent): BoardStates;
    mouseMove(event: BoardEvent): BoardStates;
}