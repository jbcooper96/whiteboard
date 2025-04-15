import Actions from '../enums/Actions.js';
import LineReducerActions from '../enums/LineReducerActions.js';
import StickerReducerActions from '../enums/StickerReducerActions.js';
import { HistoryEditor } from 'slate-history';
import LineTypes from '../enums/LineTypes';


class HistoryItemTypes {
    static STICKER_OR_LINE_EDIT = 0
    static TEXT_EDIT = 1
}

export default class ActionHistoryManager {
    constructor() {
        this.#history = [];
        this.#undoneActions = [];
    }

    #copyLinesAndStickers(lines, stickers) {
        const linesCopy = lines.map(line => {
            return {
                start: {x: line.start.x, y: line.start.y},
                end: {x: line.end.x, y: line.end.y},
                id: line.id,
                type: line.type ? line.type : LineTypes.DEFAULT
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
                lines: linesCopy,
                type: HistoryItemTypes.STICKER_OR_LINE_EDIT
            });
            this.#undoneActions = [];
        }
    }

    addTextChangeToHistory(editor, stickerId=null) {
        console.log("addTextChangeToHistory");
        if (this.#history.length === 0 || this.#history[this.#history.length - 1].stickerId !== stickerId) {
            this.#history.push({
                stickerId: stickerId,
                editor: editor,
                startUndoLength: editor.history.undos.length,
                startRedoLength: editor.history.redos.length,
                type: HistoryItemTypes.TEXT_EDIT
            });
        }
        
        this.#undoneActions = [];
    }

    clear () {
        this.#history = [];
        this.#undoneActions = [];
    }

    undo(dispatchLines, dispatchStickers, lines, stickers) {
        if (this.#history.length > 0) {
            const lastAction = this.#history.pop();

            if (lastAction.type === HistoryItemTypes.STICKER_OR_LINE_EDIT) {
                const [linesCopy, stickersCopy] = this.#copyLinesAndStickers(lines, stickers);
                this.#undoneActions.push({
                    stickers: stickersCopy,
                    lines: linesCopy,
                    type: HistoryItemTypes.STICKER_OR_LINE_EDIT
                });
                dispatchLines({type: LineReducerActions.SET_LINES, lines: lastAction.lines});
                dispatchStickers({type: StickerReducerActions.SET_STICKERS, stickers: lastAction.stickers});
            }
            else {
                HistoryEditor.undo(lastAction.editor);
                console.log(lastAction.editor.history.undos.length);
                console.log(lastAction.startUndoLength);
                if (lastAction.editor.history.undos.length > lastAction.startUndoLength) {
                    this.#history.push(lastAction);
                }
                if (this.#undoneActions.length === 0 || this.#undoneActions[this.#undoneActions.length - 1].stickerId !== lastAction.stickerId) {
                    this.#undoneActions.push(lastAction);
                }
            }
        }
    }

    redo(dispatchLines, dispatchStickers, lines, stickers) {
        if (this.#undoneActions.length > 0) {
            const lastAction = this.#undoneActions.pop();

            if (lastAction.type === HistoryItemTypes.STICKER_OR_LINE_EDIT) {
                const [linesCopy, stickersCopy] = this.#copyLinesAndStickers(lines, stickers);
                this.#history.push({
                    stickers: stickersCopy,
                    lines: linesCopy,
                    type: HistoryItemTypes.STICKER_OR_LINE_EDIT
                });
                
                dispatchLines({type: LineReducerActions.SET_LINES, lines: lastAction.lines});
                dispatchStickers({type: StickerReducerActions.SET_STICKERS, stickers: lastAction.stickers});
            }
            else {
                HistoryEditor.redo(lastAction.editor);
                console.log(lastAction.editor.history.redos.length);
                console.log(lastAction.startRedoLength);
                if (lastAction.editor.history.redos.length > lastAction.startRedoLength) {
                    this.#undoneActions.push(lastAction);
                }
                if (this.#history.length === 0 || this.#history[this.#history.length - 1].stickerId !== lastAction.stickerId) {
                    this.#history.push(lastAction);
                }
            }
            
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