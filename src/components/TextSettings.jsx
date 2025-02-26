import React from 'react';
import { useContext } from 'react';
import TextAlign from '../enums/TextAlign.js';
import { textSettingContext } from '../contexts/TextSettingsContext.jsx';
import Select from './Select.jsx';
import LeftAlignHorizontal from '../icons/LeftAlignHorizontal.jsx';
import CenterAlignHorizontal from '../icons/CenterAlignHorizontal.jsx';
import RightAlignHorizontal from '../icons/RightAlignHorizontal.jsx';
import Bold from '../icons/Bold.jsx';
import Italic from '../icons/Italic.jsx';
import Underline from '../icons/Underline.jsx';
import H1 from '../icons/H1.jsx';
import H2 from '../icons/H2.jsx';
import Body from '../icons/Body.jsx';
import OrderedList from '../icons/OrderedList.jsx';
import UnorderedList from '../icons/UnorderedList.jsx';
import Quotes from '../icons/Quotes.jsx';
import TextStyles from '../enums/TextStyles.js';


export default function TextSettings() {
    const { textSettings, changeHorizontalAlign, setBold, setItalic, setUnderline, setTextStyle } = useContext(textSettingContext);

    const getHorizontalClassname = (horizontalAlign) => {
        return horizontalAlign === textSettings.horizontalAlign ? "active" : ""
    }

    const getBoldClassname = () => {
        return textSettings.bold ? "active" : "";
    }

    const getItalicClassname = () => {
        return textSettings.italic ? "active" : "";
    }

    const getUnderlineClassname = () => {
        return textSettings.underline ? "active" : "";
    }

    const getTextStyleClassname = (textStyle) => {
        return textSettings.textStyle === textStyle ? "active" : "";
    }

    const fonts = [
        {
            label: "font 1",
            id: "font1"
        },
        {
            label: "font 2",
            id: "font2"
        },
        {
            label: "font 3",
            id: "font3"
        },
        {
            label: "font 4",
            id: "font4"
        },
    ];

    const selected = "font4";

    return (
        <div className="text-tool-bar">
            <div className="alignment-tools">
                <div className="top-row">
                    <button className={getHorizontalClassname(TextAlign.LEFT)} onClick={(event) => {
                        changeHorizontalAlign(TextAlign.LEFT);
                        event.stopPropagation();
                    }} title="Text Align Left"><LeftAlignHorizontal /></button>
                    <button className={getHorizontalClassname(TextAlign.CENTER)} onClick={(event) => {
                        changeHorizontalAlign(TextAlign.CENTER);
                        event.stopPropagation();
                    }} title="Text Align Center Horizontal"><CenterAlignHorizontal /></button>
                    <button className={getHorizontalClassname(TextAlign.RIGHT)} onClick={(event) => {
                        changeHorizontalAlign(TextAlign.RIGHT);
                        event.stopPropagation();
                    }} title="Text Align Right"><RightAlignHorizontal /></button>
                </div>
                <div className='bottom-row'>
                    <button className={getBoldClassname()} onClick={(event) => {
                        setBold(!textSettings.bold);
                        event.stopPropagation();
                    }} title="Bold"><Bold /></button>
                    <button className={getItalicClassname()} onClick={(event) => {
                        setItalic(!textSettings.italic);
                        event.stopPropagation();
                    }} title="Italic"><Italic /></button>
                    <button className={getUnderlineClassname()} onClick={(event) => {
                        setUnderline(!textSettings.underline);
                        event.stopPropagation();
                    }} title="Underline"><Underline /></button>
                </div>
            </div>
            <div className="alignment-tools">
                <div className="top-row">
                    <button className={getTextStyleClassname(TextStyles.PARAGRAPH)} onClick={(event) => {
                        setTextStyle(TextStyles.PARAGRAPH);
                        event.stopPropagation();
                    }} title="Body"><Body /></button>
                    <button className={getTextStyleClassname(TextStyles.HEADING_1)} onClick={(event) => {
                        setTextStyle(TextStyles.HEADING_1);
                        event.stopPropagation();
                    }} title="Heading 1"><H1 /></button>
                    <button className={getTextStyleClassname(TextStyles.HEADING_2)} onClick={(event) => {
                        setTextStyle(TextStyles.HEADING_2);
                        event.stopPropagation();
                    }} title="Heading 2"><H2 /></button>
                </div>
                <div className="bottom-row">
                    <button className={getTextStyleClassname(TextStyles.LIST)} onClick={(event) => {
                        setTextStyle(TextStyles.LIST);
                        event.stopPropagation();
                    }} title="Unordered List"><UnorderedList /></button>
                    <button className={getTextStyleClassname(TextStyles.NUMBERED_LIST)} onClick={(event) => {
                        setTextStyle(TextStyles.NUMBERED_LIST);
                        event.stopPropagation();
                    }} title="Numbered List"><OrderedList /></button>
                    <button className={getTextStyleClassname(TextStyles.BLOCK_QUOTE)} onClick={(event) => {
                        setTextStyle(TextStyles.BLOCK_QUOTE);
                        event.stopPropagation();
                    }} title="Numbered List"><Quotes /></button>
                </div>
            </div>
        </div>
    );
}
