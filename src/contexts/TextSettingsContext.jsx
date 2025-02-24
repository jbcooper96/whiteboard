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

    return (
        <textSettingContext.Provider value={{textSettings, changeHorizontalAlign, changeVerticalAlign}}>
            {children}
        </textSettingContext.Provider>
    )
}
