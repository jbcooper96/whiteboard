import React, { useState, useCallback, useContext, useEffect } from 'react';
import { createEditor, Transforms, Editor, Element as SlateElement } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { textSettingContext } from '../contexts/TextSettingsContext.jsx';
import TextStyles from '../enums/TextStyles.js';

const LIST_TYPES = [TextStyles.LIST, TextStyles.NUMBERED_LIST];

export default function TextEditor({ readonly, onBlur, ref }) {
    const renderElement = useCallback(props => <Element {...props} />, [])
    const renderLeaf = useCallback(props => <Leaf {...props} />, [])
    const [editor] = useState(() => withReact(createEditor()));
    const { textSettings, changeHorizontalAlign, setBold, setItalic, setUnderline, setTextStyle } = useContext(textSettingContext);

    useEffect(() => {
        if (!readonly) {
            const isList = LIST_TYPES.includes(textSettings.textStyle);
            const isActive = isBlockActive(editor, textSettings.textStyle);

            if (isList) {
                Transforms.setNodes(editor, { align: textSettings.horizontalAlign, type: TextStyles.LIST_ITEM });
            }
            else {
                Transforms.unwrapNodes(editor, {
                    match: n =>
                        !Editor.isEditor(n) &&
                        SlateElement.isElement(n) &&
                        LIST_TYPES.includes(n.type),
                    split: true,
                });

                Transforms.setNodes(editor, { align: textSettings.horizontalAlign, type: textSettings.textStyle });
            }
            Editor.addMark(editor, "bold", textSettings.bold);
            Editor.addMark(editor, "italic", textSettings.italic);
            Editor.addMark(editor, "underline", textSettings.underline);
            if (isList && !isActive) {
                const block = { type: textSettings.textStyle, children: [] }
                Transforms.wrapNodes(editor, block)
            }
        }
    }, [textSettings]);

    const initialValue = !LIST_TYPES.includes(textSettings.textStyle)
    ? [
        {
            type: textSettings.textStyle,
            align: textSettings.horizontalAlign,
            children: [
                {
                    text: 'Enter text here...',
                    bold: textSettings.bold,
                    italic: textSettings.italic,
                    underline: textSettings.underline
                }
            ],
        },
    ]
    : [
        {
            type: textSettings.textStyle,
            align: textSettings.horizontalAlign,
            children: [
                {
                    type: TextStyles.LIST_ITEM,
                    align: textSettings.horizontalAlign,
                    children: [
                        {
                            text: 'Enter text here...',
                            bold: textSettings.bold,
                            italic: textSettings.italic,
                            underline: textSettings.underline
                        }
                    ],
                }
            ],
        },
    ];




    const checkFormatting = () => {
        console.log(editor.children)
        const fragments = editor.getFragment();
        if (fragments?.length > 0) {
            if (textSettings.horizontalAlign !== fragments[0].align) {
                changeHorizontalAlign(fragments[0].align);
            }
            if (textSettings.textStyle !== fragments[0].type) {
                setTextStyle(fragments[0].type);
            }
            if (fragments[0].children?.length > 0 && fragments[0].children[0].bold !== textSettings.bold) {
                setBold(!!fragments[0].children[0].bold);
            }
            if (fragments[0].children?.length > 0 && fragments[0].children[0].italic !== textSettings.italic) {
                setItalic(!!fragments[0].children[0].italic);
            }
            if (fragments[0].children?.length > 0 && fragments[0].children[0].underline !== textSettings.underline) {
                setUnderline(!!fragments[0].children[0].underline);
            }
        }
    }

    return (
        <Slate editor={editor} initialValue={initialValue}>
            <Editable ref={ref} readOnly={readonly}
                onBlur={onBlur}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                onMouseUp={checkFormatting}
                style={{ height: "100%", overflow: "hidden" }}
            />
        </Slate>
    )
}

const isBlockActive = (editor, format, blockType = 'type') => {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n[blockType] === format,
        })
    )

    return !!match;
}

const Element = ({ attributes, children, element }) => {
    const style = { textAlign: element.align }
    switch (element.type) {
        case TextStyles.BLOCK_QUOTE:
            return (
                <q style={style} {...attributes}>
                    {children}
                </q>
            )
        case TextStyles.LIST:
            return (
                <ul style={style} {...attributes}>
                    {children}
                </ul>
            )
        case TextStyles.HEADING_1:
            return (
                <h1 style={style} {...attributes}>
                    {children}
                </h1>
            )
        case TextStyles.HEADING_2:
            return (
                <h2 style={style} {...attributes}>
                    {children}
                </h2>
            )
        case TextStyles.LIST_ITEM:
            return (
                <li style={style} {...attributes}>
                    {children}
                </li>
            )
        case TextStyles.NUMBERED_LIST:
            return (
                <ol style={style} {...attributes}>
                    {children}
                </ol>
            )
        default:
            return (
                <div style={style} {...attributes}>
                    {children}
                </div>
            )
    }
}

const Leaf = ({ attributes, children, leaf }) => {
    return (
        <span
            {...attributes}
            style={{
                fontWeight: leaf.bold ? 'bold' : 'normal',
                fontStyle: leaf.italic ? 'italic' : 'normal',
                textDecoration: leaf.underline ? 'underline' : 'none'
            }}
        >
            {children}
        </span>
    )
}


