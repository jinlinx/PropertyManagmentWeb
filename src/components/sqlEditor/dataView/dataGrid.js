import React, {useState} from 'react';
import { Table, Button, Form } from 'react-bootstrap';

export function DataGrid(props) {
    const {
        columnInfo,
        rows,        
        getFieldSort,
        doDelete,
    } = props.context;
    const [editItemData, setEditItemData] = useState({
        id: null,
        data: {},
    });
    return < Table striped bordered hover size="sm">
        <thead>
            <tr>
                {
                    columnInfo.fields.map((f, ind) => {
                        const name = f.fieldName;
                        return <th key={ind}>
                            <div>{name}</div>
                            <div>{getFieldSort(name)}</div>
                        </th>
                    })
                }
            </tr>
        </thead>
        <tbody>
            {rows.length > 0 ? (
                rows.map((row, ind) => {
                    const curId = ind;
                    const isEdit = curId === editItemData.id;
                    return (
                        <tr key={ind}>
                            {
                                columnInfo.fields.map((f, find) => {
                                    const fn = f.fieldName;
                                    let val = row[fn]
                                    let dsp = val;
                                    if (isEdit) {
                                        return <td key={find}> <Form.Control as="input" value={editItemData.data[fn]} onChange={
                                            e => {
                                                editItemData.data[fn] = e.target.value;
                                                setEditItemData({
                                                    ...editItemData,                                                    
                                                })
                                            }
                                        } /></td>    
                                    }
                                    return <td key={find}>{dsp}</td>
                                })
                            }
                            <td>
                                {<Button onClick={() => doDelete()}>Delete</Button>}
                                {<Button onClick={() => {
                                    setEditItemData({
                                        id: curId,
                                        data: {...row},
                                    });
                                }}>Edit</Button>
                                }
                            </td>
                        </tr>
                    )
                })
            ) : (
                    <tr key='a'>
                        <td>No Data found</td>
                    </tr>
                )
            }

        </tbody>
    </Table>
}