export default class StickerTypes {
    static DEFAULT = 0
    static TABLE = 1

    static getDropdownOptions() {
        return [
            {id: StickerTypes.DEFAULT, label: "empty"},
            {id: StickerTypes.TABLE, label: "table"}
        ];
    }
}