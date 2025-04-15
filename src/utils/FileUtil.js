export default class FileUtil {
    static parseFileObject(file, getLineId, getStickerId) {
        const newLines = [];
        const newStickers = [];
        for (let line of file?.lines) {
            newLines.push({
                start: {
                    x: parseInt(line?.startX),
                    y: parseInt(line?.startY)
                },
                end: {
                    x: parseInt(line?.endX),
                    y: parseInt(line?.endY)
                },
                id: getLineId()
            })
        }
        for (let sticker of file?.stickers) {
            newStickers.push({
                stickerId: getStickerId(),
                x: parseInt(sticker?.stickerX),
                y: parseInt(sticker?.stickerY),
                realX: parseInt(sticker?.stickerX),
                realY: parseInt(sticker?.stickerY),
                text: sticker?.text,
                width: parseInt(sticker.width),
                height: parseInt(sticker.height)
            })
        }
        return { newLines: newLines, newStickers: newStickers };
    }

    static getFileObject(lines, stickers) {
        const newFile = {};
        newFile.lines = [];
        newFile.stickers = [];
        for (let line of lines) {
            newFile.lines.push({
                startX: line?.start?.x,
                startY: line?.start?.y,
                endX: line?.end?.x,
                endY: line?.end?.y,
            })
        }
        for (let sticker of stickers) {
            newFile.stickers.push({
                stickerX: sticker.x,
                stickerY: sticker.y,
                text: sticker.text ? sticker.text : "",
                width: sticker.width,
                height: sticker.height
            });
        }

        return newFile;
    }
}
