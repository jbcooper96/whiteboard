import React from 'react';
import { useContext } from 'react';
import TextAlign from '../enums/TextAlign.js';
import { textSettingContext } from '../contexts/TextSettingsContext.jsx';
import BottomAlignVertical from '../icons/BottomAliginVertical.jsx';
import CenterAlignVertical from '../icons/CenterAlignVertical.jsx';
import TopAlignVertical from '../icons/TopAliginVertical.jsx';
import LeftAlignHorizontal from '../icons/LeftAlignHorizontal.jsx';
import CenterAlignHorizontal from '../icons/CenterAlignHorizontal.jsx';
import RightAlignHorizontal from '../icons/RightAlignHorizontal.jsx';


export default function TextSettings() {
    const { textSettings, changeHorizontalAlign, changeVerticalAlign } = useContext(textSettingContext);

    const getHorizontalClassname = (horizontalAlign) => {
        return horizontalAlign === textSettings.horizontalAlign ? "active" : ""
    }

    const getVerticalClassname = (verticalAlign) => {
        return verticalAlign === textSettings.verticalAlign ? "active" : ""
    }

    return (
        <div className="text-tool-bar">
            <div className="alignment-tools">
                <div className="top-row">
                    <button className={getHorizontalClassname(TextAlign.LEFT)} onClick={() => changeHorizontalAlign(TextAlign.LEFT)} title="Text Align Left"><LeftAlignHorizontal /></button>
                    <button className={getHorizontalClassname(TextAlign.CENTER)} onClick={() => changeHorizontalAlign(TextAlign.CENTER)} title="Text Align Center Horizontal"><CenterAlignHorizontal /></button>
                    <button className={getHorizontalClassname(TextAlign.RIGHT)} onClick={() => changeHorizontalAlign(TextAlign.RIGHT)} title="Text Align Right"><RightAlignHorizontal /></button>
                </div>
                <div className="bottom-row">
                    <button className={getVerticalClassname(TextAlign.TOP)} onClick={() => changeVerticalAlign(TextAlign.TOP)} title="Text Align Top"><TopAlignVertical /></button>
                    <button className={getVerticalClassname(TextAlign.CENTER)} onClick={() => changeVerticalAlign(TextAlign.CENTER)} title="Text Align Center Vertical"><CenterAlignVertical /></button>
                    <button className={getVerticalClassname(TextAlign.BOTTOM)} onClick={() => changeVerticalAlign(TextAlign.BOTTOM)} title="Text Align Bottom"><BottomAlignVertical /></button>
                </div>
            </div>
        </div>
    );
}