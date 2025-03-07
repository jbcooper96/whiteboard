import StickerReducerActions from "../enums/StickerReducerActions";
import getStickerId from "../utils/StickerIdGenerator";
import StickerTypes from "../enums/StickerTypes";

const DEFAULT_STICKER_HEIGHT = 50;
const DEFAULT_STICKER_WIDTH = 200;

const setDefaultStickerSize = (newSticker) => {
    if (newSticker.width === undefined) newSticker.width = DEFAULT_STICKER_WIDTH;
    if (newSticker.height === undefined) newSticker.height = DEFAULT_STICKER_HEIGHT;
}

export default function stickerReducer(state, action) {
    switch (action.type) {
        case StickerReducerActions.ADD_STICKER: {
            if (action.sticker.stickerId === undefined)
                action.sticker.stickerId = getStickerId();
            if (action.sticker.type === undefined)
                action.sticker.type = StickerTypes.DEFAULT;
            setDefaultStickerSize(action.sticker);
            return [...state, action.sticker];
        }
        case StickerReducerActions.REMOVE_STICKER: {
            const newStickers = state.map(s => { return { ...s } });
            return newStickers.filter(s => s.stickerId !== action.stickerId);
        }
        case StickerReducerActions.CHANGE_TEXT: {
            return state.map(stickerOld => {
                if (stickerOld.stickerId != action.stickerId) {
                    return stickerOld;
                }
                else {
                    return { ...stickerOld, text: action.text }
                }
            });
        }
        case StickerReducerActions.CLEAR_STICKERS: {
            return [];
        }
        case StickerReducerActions.MOVE_STICKER: {
            return state.map(stickerOld => {
                if (stickerOld.stickerId != action.stickerId || action.x < 0 || action.y < 0) {
                    return stickerOld;
                }
                else {
                    let attachedLines = [];
                    if (stickerOld.attachedLines && action.dispatchLines) {
                        attachedLines = stickerOld.attachedLines.map(attachedLine => {
                            let newX = action.x - stickerOld.x + attachedLine.x;
                            let newY = action.y - stickerOld.y + attachedLine.y;
                            action.dispatchLines({
                                type: LineReducerActions.EDIT_LINE,
                                lineId: attachedLine.id,
                                linePointType: attachedLine.linePoint,
                                point: { x: newX, y: newY }
                            });
                            return { ...attachedLine, x: newX, y: newY };
                        });
                    }
                    return {
                        ...stickerOld,
                        attachedLines: attachedLines,
                        x: action.x ? action.x : stickerOld.x,
                        y: action.y ? action.y : stickerOld.y,
                        realX: action.realX ? action.realX : stickerOld.realX,
                        realY: action.realY ? action.realY : stickerOld.realY
                    }
                }
            });
        }
        case StickerReducerActions.SET_STICKERS: {
            action.stickers = action.stickers.map(s => {
                const newSticker = { ...s };
                setDefaultStickerSize(newSticker);
                return newSticker;
            });
            return action.stickers;
        }
        case StickerReducerActions.RESIZE_STICKER: {
            return state.map(stickerOld => {
                if (stickerOld.stickerId != action.stickerId) {
                    return stickerOld;
                }
                else {
                    let attachedLines = [];
                    if (stickerOld.attachedLines && action.dispatchLines) {
                        attachedLines = stickerOld.attachedLines.map(attachedLine => {
                            let [newX, newY] = CanvisLogicHandler.getNewAttachPoint(
                                stickerOld.x, stickerOld.y, stickerOld.width, stickerOld.height,
                                action.x ? action.x : stickerOld.x,
                                action.y ? action.y : stickerOld.y,
                                action.width ? action.width : stickerOld.width,
                                action.height ? action.height : stickerOld.height,
                                attachedLine.x, attachedLine.y
                            );
                            action.dispatchLines({
                                type: LineReducerActions.EDIT_LINE,
                                lineId: attachedLine.id,
                                linePointType: attachedLine.linePoint,
                                point: { x: newX, y: newY }
                            });
                            return { ...attachedLine, x: newX, y: newY };
                        });
                    }
                    return {
                        ...stickerOld,
                        x: action.x ? action.x : stickerOld.x,
                        y: action.y ? action.y : stickerOld.y,
                        realX: action.realX ? action.realX : stickerOld.realX,
                        realY: action.realY ? action.realY : stickerOld.realY,
                        height: action.height ? action.height : stickerOld.height,
                        width: action.width ? action.width : stickerOld.width,
                        attachedLines: attachedLines
                    }
                }
            });
        }
        case StickerReducerActions.RESET_REAL_SIZE_AND_COORDS: {
            return state.map(stickerOld => {
                return {
                    ...stickerOld,
                    realX: stickerOld.x,
                    realY: stickerOld.y
                }
            })
        }
        case StickerReducerActions.ADD_LINE_CONNECTION: {
            return state.map(stickerOld => {
                if (action.stickerId !== undefined && action.stickerId === stickerOld.stickerId) {
                    let attachedLines = [];
                    if (stickerOld.attachedLines) {
                        attachedLines = stickerOld.attachedLines.map(line => { return { ...line }; });
                    }
                    console.log(attachedLines);
                    attachedLines.push({
                        id: action.lineId,
                        x: action.x,
                        y: action.y,
                        linePoint: action.linePoint
                    });
                    return { ...stickerOld, attachedLines: attachedLines };
                }
                else {
                    return stickerOld;
                }
            });
        }
    }
}