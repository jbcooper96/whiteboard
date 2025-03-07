import LineReducerActions from "../enums/LineReducerActions.js";
import LinePoint from "../enums/LinePoint.js";
import getLineId from "../utils/LineIdGenerator.js";

export default function lineReducer(state, action) {
    switch (action.type) {
        case LineReducerActions.ADD_LINE: {
            return [...state, action.line];
        }
        case LineReducerActions.REMOVE_LINE: {
            const newLines = state.map(l => { return { ...l } });
            return newLines.filter((l) => l.id !== action.id);
        }
        case LineReducerActions.EDIT_LINE: {
            return state.map(l => {
                let newLine = { ...l };
                if (l.id === action.lineId) {
                    if (action.linePointType === LinePoint.START) {
                        newLine.start.x = action.point.x;
                        newLine.start.y = action.point.y;
                    }
                    else if (action.linePointType === LinePoint.END) {
                        newLine.end.x = action.point.x;
                        newLine.end.y = action.point.y;
                    }
                }
                return newLine;
            });
        }
        case LineReducerActions.CLEAR_LINES: {
            return [];
        }
        case LineReducerActions.SET_LINES: {
            return action.lines;
        }
        case LineReducerActions.HOVER_LINE: {
            return state.map((l) => {
                const newLine = { ...l };
                newLine.hover = l.id === action.id;
                return newLine;
            })
        }
        case LineReducerActions.RESET_HOVER: {
            let anyHover = false;
            const newLines = state.map((l) => {
                anyHover = anyHover || l.hover;
                return { ...l, hover: false };
            });
            return anyHover ? newLines : state;
        }
    }
}