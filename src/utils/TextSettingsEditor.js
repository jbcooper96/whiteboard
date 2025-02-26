import TextAlign from '../enums/TextAlign.js';
import TextStyles from '../enums/TextStyles.js';

export default class TextSettingsEditor {
    static setTextAlignVertical (prevSettings, textAlign) {
        const verticalAlignValues = [TextAlign.TOP, TextAlign.CENTER, TextAlign.BOTTOM];
        if (verticalAlignValues.includes(textAlign)) {
            return {...prevSettings, verticalAlign: textAlign};
        }
        return {...prevSettings}
    }

    static setTextAlignHorizontal (prevSettings, textAlign) {
        const horizontalAlignValues = [TextAlign.LEFT, TextAlign.CENTER, TextAlign.RIGHT];
        if (horizontalAlignValues.includes(textAlign)) {
            return {...prevSettings, horizontalAlign: textAlign};
        }
        return {...prevSettings}
    }

    static setBold(prevSettings, bold) {
        return {...prevSettings, bold: bold};
    }

    static setItalic(prevSettings, italic) {
        return {...prevSettings, italic: italic};
    }

    static setUnderline(prevSettings, underline) {
        return {...prevSettings, underline: underline};
    }

    static setTextStyle(prevSettings, textStyle) {
        const textStyleValues = [TextStyles.PARAGRAPH, TextStyles.HEADING_1, TextStyles.HEADING_2, TextStyles.LIST, TextStyles.NUMBERED_LIST, TextStyles.BLOCK_QUOTE];
        if (textStyleValues.includes(textStyle)) {
            return {...prevSettings, textStyle: textStyle};
        }
        return {...prevSettings};
    }

    static getDefaultSettings() {
        return {
            horizontalAlign: TextAlign.CENTER,
            verticalAlign: TextAlign.CENTER,
            bold: false,
            italic: false,
            underline: false,
            textStyle: TextStyles.PARAGRAPH
        }
    }

    static areSettingsEqual(settings1, settings2) {
        for (let prop in settings1) {
            if (settings1[prop] !== settings2[prop]) {
                return false;
            }
        }
        return true;
    }
}