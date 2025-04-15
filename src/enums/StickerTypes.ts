export enum StickerTypes {
    DEFAULT = 0,
    TABLE,
    TEXTBOX
}

export function getDropdownOptions() {
    return [
        {id: StickerTypes.DEFAULT, label: "Empty"},
        //{id: StickerTypes.TABLE, label: "Table"},
        {id: StickerTypes.TEXTBOX, label: "Text Box"}
    ];
}
