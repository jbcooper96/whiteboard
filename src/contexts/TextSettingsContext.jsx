import React from 'react';
import {createContext, useState} from 'react';
import TextSettingsEditor from '../utils/TextSettingsEditor.js';

export const textSettingContext = createContext(null);

export function TextSettingsProvider({children}) {
    const [textSettings, setTextSettings] = useState(TextSettingsEditor.getDefaultSettings());

    const changeHorizontalAlign = (textAlign) => {
        setTextSettings((prevState) => TextSettingsEditor.setTextAlignHorizontal(prevState, textAlign));
    }

    const changeVerticalAlign = (textAlign) => {
        setTextSettings((prevState) => TextSettingsEditor.setTextAlignVertical(prevState, textAlign));
    }

    const setBold = (bold) => {
        setTextSettings((prevState) => TextSettingsEditor.setBold(prevState, bold));
    }

    const setItalic = (italic) => {
        setTextSettings((prevState) => TextSettingsEditor.setItalic(prevState, italic));
    }

    const setUnderline = (underline) => {
        setTextSettings((prevState) => TextSettingsEditor.setUnderline(prevState, underline));
    }

    const setTextStyle = (textStyle) => {
        setTextSettings((prevState) => TextSettingsEditor.setTextStyle(prevState, textStyle));
    }

    const setTextStyleAndListDepth = (textStyle, depth) => {
        setTextSettings((prevState) => TextSettingsEditor.setTextStyle(prevState, textStyle, depth));
    }

    return (
        <textSettingContext.Provider value={{
            textSettings, 
            changeHorizontalAlign, 
            changeVerticalAlign, 
            setBold, 
            setItalic, 
            setUnderline,
            setTextStyle,
            setTextStyleAndListDepth
        }}>
            {children}
        </textSettingContext.Provider>
    )
}
