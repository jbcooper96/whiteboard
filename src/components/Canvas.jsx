import React from 'react';
import { useRef, useEffect, useImperativeHandle } from 'react';
import BoardStates from '../enums/BoardStates';
import LinePoint from '../enums/LinePoint';

const LINE_COLOR = "#583101"
const LINE_COLOR_HOVER = "#b0b0b0"

const LINE_POINT_EDIT_CIRCLE_RADIUS = 6;

export default function Canvas({ lines, ref, eventManager }) {
    const canvas = useRef(null);

    useEffect(() => {
        redraw();
    }, [lines]);

    useImperativeHandle(ref, () => {
        return {
            getBoundingClientRect: () => {
                return canvas.current.getBoundingClientRect();
            },
            drawCircle: (x, y, radius) => {
                drawCircle(x, y, radius);
            },
            drawLine: (line) => {
                drawLine(line);
            },
            redraw: () => {
                redraw();
            }
        }
    }, [canvas, lines]);

    const drawCircle = (x, y, radius) => {
        const ctx = canvas.current.getContext("2d");
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    const drawLine = (line) => {
        const ctx = canvas.current.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = line.hover ? LINE_COLOR_HOVER : LINE_COLOR;
        ctx.stroke();
    }

    const redraw = () => {
        if (canvas.current) {
            const ctx = canvas.current.getContext("2d");
            ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
            for (let line of lines) {
                drawLine(line);
                if (eventManager.eventHandler.lineBeingEditiedId !== undefined && line.id === eventManager.eventHandler.lineBeingEditiedId) {
                    let point = eventManager.eventHandler.linePointBeingEdited === LinePoint.START ? line.start : line.end;
                    drawCircle(point?.x, point?.y, LINE_POINT_EDIT_CIRCLE_RADIUS);
                }
            }
        }
    }

    return (<canvas height="1000" width="2000" ref={canvas} />);
}