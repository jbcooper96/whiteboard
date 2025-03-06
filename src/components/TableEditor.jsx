import React, { useState, useCallback, useContext, useEffect } from 'react';
import { createEditor, Point, Range, Transforms, Editor, Element as SlateElement } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory, HistoryEditor } from 'slate-history';
import { textSettingContext } from '../contexts/TextSettingsContext.jsx';
import TextStyles from '../enums/TextStyles.js';

const LIST_TYPES = [TextStyles.LIST, TextStyles.NUMBERED_LIST];


export default function TableEditor({ readonly, ref, onEditText, text, updateHistory }) {
    const renderElement = useCallback(props => <Element {...props} />, [])
    const renderLeaf = useCallback(props => <Leaf {...props} />, [])
    const [editor] = useState(() => withTables(withReact(withHistory(createEditor()))));
    const { textSettings, changeHorizontalAlign, setBold, setItalic, setUnderline, setTextStyle, setTextStyleAndListDepth } = useContext(textSettingContext);

    /** 
    useEffect(() => {
        if (!readonly) {
            checkFormatting();
        }
    }, [readonly])*/

    /** 
    useEffect(() => {
        if (!readonly) {
            const isList = LIST_TYPES.includes(textSettings.textStyle);
            let listDepth = getListDepth(editor);

            let canIndentFurther = true;
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
    */

    const initialValue = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  children: [{type:'paragraph', children: [{ text: '' }]}],
                },
                {
                  type: 'table-cell',
                  children: [{type:'paragraph', children: [{ text: 'Human', bold: true }]}],
                },
                {
                  type: 'table-cell',
                  children: [{type:'paragraph', children: [{ text: 'Dog', bold: true }]}],
                },
                {
                  type: 'table-cell',
                  children: [{type:'paragraph', children: [{ text: 'Cat', bold: true }]}],
                },
              ],
            },
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  children: [{type:'paragraph', children: [{ text: '# of Feet', bold: true }]}],
                },
                {
                  type: 'table-cell',
                  children: [{type:'paragraph', children: [{ text: '2' }]}],
                },
                {
                  type: 'table-cell',
                  children: [{type:'paragraph', children: [{ text: '4' }]}],
                },
                {
                  type: 'table-cell',
                  children: [{type:'paragraph', children: [{ text: '4' }]}],
                },
              ],
            },
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  children: [{type:'paragraph', children: [{ text: '# of Lives', bold: true }]}],
                },
                {
                  type: 'table-cell',
                  children: [{type:'paragraph', children: [{ text: '1' }]}],
                },
                {
                  type: 'table-cell',
                  children: [{type:'paragraph', children: [{ text: '1' }]}],
                },
                {
                  type: 'table-cell',
                  children: [{type:'paragraph', children: [{ text: '9' }]}],
                },
              ],
            },
          ],
        },
    ];




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
        //checkFormatting();
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
                //onMouseUp={checkFormatting}
                onKeyDown={keyDown}
                style={{ height: "100%", overflow: "hidden" }}
            />
        </Slate>
    )
}

const withTables = editor => {
    const { deleteBackward, deleteForward, deleteFragment} = editor
    editor.deleteBackward = unit => {
        const { selection } = editor
        if (selection && Range.isCollapsed(selection)) {
            const [cell] = Editor.nodes(editor, {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    n.type === 'table-cell',
            })
            if (cell) {
                const [, cellPath] = cell
                const start = Editor.start(editor, cellPath)
                if (Point.equals(selection.anchor, start)) {
                    return
                }
            }
        }
        deleteBackward(unit)
    }
    editor.deleteForward = unit => {
        const { selection } = editor
        if (selection && Range.isCollapsed(selection)) {
            const [cell] = Editor.nodes(editor, {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    n.type === 'table-cell',
            })
            if (cell) {
                const [, cellPath] = cell
                const end = Editor.end(editor, cellPath)
                if (Point.equals(selection.anchor, end)) {
                    return
                }
            }
        }
        deleteForward(unit)
    }
    editor.deleteFragment = () => {
        const { selection } = editor
        if (selection) {
            console.log(selection)
            const cells = Array.from(Editor.nodes(editor, {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    n.type === 'table-cell',
            }))
            console.log(cells)
            for (let cell of cells) {
                const [, cellPath] = cell;
                if (
                    Range.includes(selection, Editor.end(editor, cellPath)) 
                    && Range.includes(selection, Editor.start(editor, cellPath))
                ){
                    /** 
                    const leaves = Array.from(Editor.nodes(editor, {
                        match: n =>
                            !Editor.isEditor(n) &&
                            !SlateElement.isElement(n)
                    }));
                    for (let leaf of leaves) {
                        const [, leafPath] = leaf;
                        if (
                            Range.includes(selection, Editor.end(editor, leafPath)) 
                            && Range.includes(selection, Editor.start(editor, leafPath))
                        ){
                            Transforms.delete(editor, {
                                at: {
                                    anchor: Editor.start(editor, leafPath),
                                    focus: Editor.end(editor, leafPath)
                                }
                            });
                        }
                    }
                        */
                    return;
                }
            }
        }
        console.log("fragment")
        deleteFragment();
    }
    /** 
    editor.insertBreak = () => {
        
        const { selection } = editor
        if (selection) {
            const [table] = Editor.nodes(editor, {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    n.type === 'table',
            })
            
            if (table) {
                console.log("table");
                return
            }
        }
        insertBreak()
    }
    */

    return editor
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
        case 'table':
            return (
                <table>
                    <tbody {...attributes}>{children}</tbody>
                </table>
            )
        case 'table-row':
            return <tr {...attributes}>{children}</tr>
        case 'table-cell':
            return <td {...attributes}>{children}</td>
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


