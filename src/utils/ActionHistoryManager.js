import Actions from '../enums/Actions.js';
import LineReducerActions from '../enums/LineReducerActions.js';
import StickerReducerActions from '../enums/StickerReducerActions.js';

export default class ActionHistoryManager {
    constructor() {
        this.#history = [];
        this.#undoneActions = [];
    }

    #copyLinesAndStickers(lines, stickers) {
        const linesCopy = lines.map(line => {
            return {
                start: {x: line.start.x, y: line.start.y},
                end: {x: line.end.x, y: line.end.y}
            }
        });
        const stickersCopy = stickers.map(sticker => {return {...sticker}});
        return [linesCopy, stickersCopy];
    }

    #canAddToHistory(lines, stickers) {
        if (this.#history.length === 0) return true;

        const lastSnapshot = this.#history[this.#history.length - 1];
        if (JSON.stringify(lastSnapshot.lines) !== JSON.stringify(lines)) return true;
        if (JSON.stringify(lastSnapshot.stickers) !== JSON.stringify(stickers)) return true;
        return false;
    }

    addToHistory (lines, stickers) {
        if (this.#canAddToHistory(lines, stickers)) {
            const [linesCopy, stickersCopy] = this.#copyLinesAndStickers(lines, stickers);
            this.#history.push({
                stickers: stickersCopy,
                lines: linesCopy
            });
            this.#undoneActions = [];
        }
    }

    clear () {
        this.#history = [];
        this.#undoneActions = [];
    }

    undo(dispatchLines, dispatchStickers, lines, stickers) {
        if (this.#history.length > 0) {
            const [linesCopy, stickersCopy] = this.#copyLinesAndStickers(lines, stickers);
            this.#undoneActions.push({
                stickers: stickersCopy,
                lines: linesCopy
            });
            const lastAction = this.#history.pop();
            dispatchLines({type: LineReducerActions.SET_LINES, lines: lastAction.lines});
            dispatchStickers({type: StickerReducerActions.SET_STICKERS, stickers: lastAction.stickers});
        }
    }

    redo(dispatchLines, dispatchStickers, lines, stickers) {
        if (this.#undoneActions.length > 0) {
            const [linesCopy, stickersCopy] = this.#copyLinesAndStickers(lines, stickers);
            this.#history.push({
                stickers: stickersCopy,
                lines: linesCopy
            });
            const lastAction = this.#undoneActions.pop();
            dispatchLines({type: LineReducerActions.SET_LINES, lines: lastAction.lines});
            dispatchStickers({type: StickerReducerActions.SET_STICKERS, stickers: lastAction.stickers});
        }
    }

    canUndo() {
        return this.#history.length > 0;
    }

    canRedo() {
        return this.#undoneActions.length > 0;
    }

    #history
    #undoneActions
}