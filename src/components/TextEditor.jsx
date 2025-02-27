import React, { useState, useCallback, useContext, useEffect } from 'react';
import { createEditor, Transforms, Editor, Element as SlateElement } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory, HistoryEditor } from 'slate-history';
import { textSettingContext } from '../contexts/TextSettingsContext.jsx';
import TextStyles from '../enums/TextStyles.js';

const LIST_TYPES = [TextStyles.LIST, TextStyles.NUMBERED_LIST];


export default function TextEditor({ readonly, ref, onEditText, text, updateHistory }) {
    const renderElement = useCallback(props => <Element {...props} />, [])
    const renderLeaf = useCallback(props => <Leaf {...props} />, [])
    const [editor] = useState(() => withReact(withHistory(createEditor())));
    const { textSettings, changeHorizontalAlign, setBold, setItalic, setUnderline, setTextStyle, setTextStyleAndListDepth } = useContext(textSettingContext);

    useEffect(() => {
        if (!readonly) {
            checkFormatting();
        }
    }, [readonly])

    useEffect(() => {
        if (!readonly) {
            const isList = LIST_TYPES.includes(textSettings.textStyle);
            let listDepth = getListDepth(editor);

            let canIndentFurther = true;
            /** code to prevent indenting further if there will be no list items on previous depth
             
            if (listDepth > 0) {
                const { selection } = editor;
                if (selection?.anchor?.path?.length > 1 && selection.anchor.path[selection.anchor.path.length - 2] === 0) {
                    canIndentFurther = false;
                }   
                if (selection?.focus?.path?.length > 1 && selection.focus.path[selection.focus.path.length - 2] === 0) {
                    canIndentFurther = false;
                } 
            }
            console.log(canIndentFurther);
            */
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
            if (isList && canIndentFurther && listDepth < textSettings.listDepth) {
                const block = { type: textSettings.textStyle, children: [] }
                Transforms.wrapNodes(editor, block)
            }
            while (isList && listDepth > textSettings.listDepth) {
                Transforms.liftNodes(editor);
                listDepth = getListDepth(editor);
            }
        }
    }, [textSettings]);

    let initialValue;
    try {
        initialValue = JSON.parse(text);
    }
    catch (err) { }
    

    if (!initialValue) {
        initialValue = !LIST_TYPES.includes(textSettings.textStyle)
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
    }





    const checkFormatting = () => {
        const listDepth = getListDepth(editor);
        const fragments = editor.getFragment();
        if (fragments?.length > 0) {
            if (textSettings.horizontalAlign !== fragments[0].align) {
                changeHorizontalAlign(fragments[0].align);
            }
            if (textSettings.textStyle !== fragments[0].type) {

                if (listDepth > 0) {
                    setTextStyleAndListDepth(fragments[0].type, listDepth)
                }
                else {
                    setTextStyle(fragments[0].type);
                }
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

    const keyDown = (event) => {
        checkFormatting();
        if (event.ctrlKey) {
            if (event.key === "Backspace" && LIST_TYPES.includes(textSettings.textStyle)) {
                if (textSettings.listDepth > 1) {
                    setTextStyleAndListDepth(textSettings.textStyle, textSettings.listDepth - 1);
                }
                else {
                    setTextStyleAndListDepth(TextStyles.PARAGRAPH, 0);
                }
            }
            if (event.key === 'z') {
                HistoryEditor.undo(editor);
            }
            event.preventDefault();
        }
        else if (event.key === 'Tab' && LIST_TYPES.includes(textSettings.textStyle)) {
            setTextStyleAndListDepth(textSettings.textStyle, textSettings.listDepth + 1);
            event.preventDefault();
        }
        updateHistory(editor);
    }

    return (
        <Slate
            editor={editor} initialValue={initialValue}
            onChange={value => {
                const isAstChange = editor.operations.some(
                    op => 'set_selection' !== op.type
                )
                if (isAstChange) {
                    const content = JSON.stringify(value);
                    onEditText(content, editor);
                }
            }}
        >
            <Editable ref={ref} readOnly={readonly}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                onMouseUp={checkFormatting}
                onKeyDown={keyDown}
                style={{ height: "100%", overflow: "hidden" }}
            />
        </Slate>
    )
}

const getListDepth = (editor) => {
    const { selection } = editor
    if (!selection) return 0

    const match = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                LIST_TYPES.includes(n.type),
        })
    )
    return !!match ? match.length : 0;
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


