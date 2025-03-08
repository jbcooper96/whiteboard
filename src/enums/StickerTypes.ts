export enum StickerTypes {
    DEFAULT = 0,
    TABLE
}

export function getDropdownOptions() {
    return [
        {id: StickerTypes.DEFAULT, label: "empty"},
        {id: StickerTypes.TABLE, label: "table"}
    ];
}
