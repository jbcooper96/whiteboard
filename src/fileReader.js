import fs from 'fs'

class Tags {
    static NAME = 'name'
    static CREATED_DATE = 'created'
    static LAST_MODIFIED = 'modified'
    static STICKER = 'sticker'
    static LINE = 'line'
    static STARTX = 'startx'
    static ENDX = 'endx'
    static STARTY = 'starty'
    static ENDY = 'endy'
    static STICKER = 'sticker'
    static STICKERX = 'stickerx'
    static STICKERY = 'stickery'
    static STICKER_WIDTH = 'width'
    static STICKER_HEIGHT = 'height'
    static STICKER_TEXT = 'stickertext'
}



export default class File {
    constructor(filePlaintext="") {
        this.createdDate = Date.now();
        this.#parseName(filePlaintext);
        this.#parseCreatedDate(filePlaintext);
        this.#parseModifiedDate(filePlaintext);
        this.#parseLines(filePlaintext);
        this.#parseStickers(filePlaintext);
    }

    static readFromFile(filePath) {
        let fileText = fs.readFileSync(filePath, 'utf-8');
        let file = new File(fileText);
        return file;
    }

    saveToFile(filePath) {
        if (!this.name) {
            const fileName = filePath.split("/").pop();
            this.name = fileName.split(".")[0];
        }
        this.modifiedDate = Date.now();
        let fileText = this.#getFileText();
        fs.writeFileSync(filePath, fileText, 'utf-8');
    }

    #getFileText() {
        let fileText = '';
        if (this.name) {
            fileText += this.#createTag(Tags.NAME, this.name);
        }
        if (this.createdDate) {
            fileText += this.#createTag(Tags.CREATED_DATE, this.createdDate);
        }
        if (this.modifiedDate) {
            fileText += this.#createTag(Tags.LAST_MODIFIED, this.modifiedDate);
        }
        if (this.lines?.length > 0) {
            for (let line of this.lines) {
                let lineBody = '';
                if (line.startX) lineBody += this.#createTag(Tags.STARTX, line.startX);
                if (line.startY) lineBody += this.#createTag(Tags.STARTY, line.startY);
                if (line.endX) lineBody += this.#createTag(Tags.ENDX, line.endX);
                if (line.endY) lineBody += this.#createTag(Tags.ENDY, line.endY);
                fileText += this.#createTag(Tags.LINE, lineBody);
            }
        }
        if (this.stickers?.length > 0) {
            for (let sticker of this.stickers) {
                let stickerBody = '';
                if (sticker.stickerX) stickerBody += this.#createTag(Tags.STICKERX, sticker.stickerX);
                if (sticker.stickerY) stickerBody += this.#createTag(Tags.STICKERY, sticker.stickerY);
                if (sticker.text) stickerBody += this.#createTag(Tags.STICKER_TEXT, sticker.text);
                if (sticker.width) stickerBody += this.#createTag(Tags.STICKER_WIDTH, sticker.width);
                if (sticker.height) stickerBody += this.#createTag(Tags.STICKER_HEIGHT, sticker.height);
                fileText += this.#createTag(Tags.STICKER, stickerBody);
            }
        }
        return fileText;
    }

    #parseStickers(filePlaintext) {
        const stickers = this.#parseTag(filePlaintext, Tags.STICKER);
        this.stickers = [];
        for (let sticker of stickers) {
            const stickerTmp = {};
            const stickerX = this.#parseTag(sticker, Tags.STICKERX);
            if (stickerX?.length > 0) stickerTmp.stickerX = stickerX[0];
            const stickerY = this.#parseTag(sticker, Tags.STICKERY);
            if (stickerY?.length > 0) stickerTmp.stickerY = stickerY[0];
            const text = this.#parseTag(sticker, Tags.STICKER_TEXT);
            if (text?.length > 0) stickerTmp.text = text[0];
            const width = this.#parseTag(sticker, Tags.STICKER_WIDTH);
            if (width?.length > 0) stickerTmp.width = width[0];
            const height = this.#parseTag(sticker, Tags.STICKER_HEIGHT);
            if (height?.length > 0) stickerTmp.height = height[0];

            this.stickers.push(stickerTmp);
        }
    }

    #parseLines(filePlaintext) {
        const lines = this.#parseTag(filePlaintext, Tags.LINE);
        this.lines = [];
        for (let line of lines) {
            const lineTmp = {};
            const startX = this.#parseTag(line, Tags.STARTX);
            if (startX?.length > 0) lineTmp.startX = startX[0];
            const startY = this.#parseTag(line, Tags.STARTY);
            if (startY?.length > 0) lineTmp.startY = startY[0];
            const endX = this.#parseTag(line, Tags.ENDX);
            if (endX?.length > 0) lineTmp.endX = endX[0];
            const endY = this.#parseTag(line, Tags.ENDY);
            if (endY?.length > 0) lineTmp.endY = endY[0];

            this.lines.push(lineTmp);
        }
    }

    #parseModifiedDate(filePlaintext) {
        const modifiedDateList = this.#parseTag(filePlaintext, Tags.LAST_MODIFIED);
        if (modifiedDateList?.length > 0) {
            this.modifiedDate = new Date(modifiedDateList[0]);
        }
    }

    #parseCreatedDate(filePlaintext) {
        const createdDateList = this.#parseTag(filePlaintext, Tags.CREATED_DATE);
        if (createdDateList?.length > 0) {
            this.createdDate = new Date(createdDateList[0]);
        }
    }

    #parseName(filePlaintext) {
        const nameList = this.#parseTag(filePlaintext, Tags.NAME);
        if (nameList?.length > 0) {
            this.name = nameList[0];
        }
    }

    #parseTag(filePlaintext, tag) {
        const results = []
        let skip = true;
        for (let fileSplit of filePlaintext.split('<' + tag + '>')) {
            if (!skip) {
                const tagContent = fileSplit.split('</' + tag + '>')
                if (tagContent?.length >1) {
                    results.push(tagContent[0])
                }
            }
            skip = false;
        }
        return results;
    }

    #createTag(tag, body) {
        return '<' + tag + '>' + body + '</' + tag + '>';
    }
}