class Cell {
    width: number;
    height: number;
    text: string;
    constructor(width: number, height: number, text: string) {
        this.width = width;
        this.height = height;
        this.text = text;
    }

    widthPercentString(): string {
        return String(this.width) + "%";
    }
}

class Row {
    cells: Cell[];

    constructor(cells: Cell[]) {
        this.cells = cells;
    }

    height(): number {
        let maxHeight = 0;
        for (let cell of this.cells) {
            if (cell.height > maxHeight) {
                maxHeight = cell.height;
            }
        }
        return maxHeight;
    }

    heightPercentString(): string {
        return String(this.height()) + "%";
    }
}

export default class TableDetails {
    rows: Row[];
    rowCount: number;
    columnCount: number;

    constructor(rows: number, columns: number) {
        this.rowCount = rows;
        this.columnCount = columns;
        this.rows = [];
        let width = 100 / columns;
        let height = 100 / rows;

        for (let i = 0; i < rows; ++i) {
            let cells = [];
            for (let j = 0; j < columns; ++j) {
                cells.push(new Cell(width, height, ""));
            }
            this.rows.push(new Row(cells));
        }

    }
}