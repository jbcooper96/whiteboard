let stickerId = 0;

export default function getStickerId() {
    stickerId += 1;
    return stickerId - 1;
}