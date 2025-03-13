import TextEditor from "./TextEditor";
import React from "react";
import { useRef } from "react";
import { Editor } from 'slate'
import TableDetails from "../models/TableDetails";

export default function TableEditor({
    readonly, 
    onEditText, 
    updateHistory,
    text
}: Readonly<{
    readonly: boolean,
    onEditText: Function,
    updateHistory: Function,
    text: string
}>) {
    const textAreaRef = useRef<Editor>(null);
    const tableDetails = new TableDetails(4, 5);
    console.log(tableDetails);

    return (
        <table>
            {tableDetails.rows.map(row => {
                return (
                    <tr style={{height: row.heightPercentString()}}>
                        {row.cells.map(cell => {
                            return (
                                <td style={{width: cell.widthPercentString()}}>
                                    <TextEditor text={cell.text} ref={textAreaRef} readonly={readonly} onEditText={onEditText} updateHistory={updateHistory}/>
                                </td>
                            );
                        })}
                    </tr>
                );
            })}
        </table>
    )
}