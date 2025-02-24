import TextAlign from '../enums/TextAlign.js';

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

    static getDefaultSettings() {
        return {
            horizontalAlign: TextAlign.CENTER,
            verticalAlign: TextAlign.CENTER
        }
    }
}