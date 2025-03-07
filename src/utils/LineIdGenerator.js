let lineId = 0;

export default function getLineId() {
    lineId += 1;
    return lineId - 1;
}