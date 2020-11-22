import React, {useState} from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { sqlFreeForm } from '../../api';
import moment from 'moment';

export function toSqlVal(fieldType, val) {
    if (fieldType === 'date' || fieldType === 'datetime') {
        if (!val) return 'null';
        else {
            const fmtStr = fieldType === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';
            return `'${moment(val).format(fmtStr)}'`;
        }
    } else if (val !== 0) {
        if (val === '') return "''";
        else if (!val) return 'null';
        else {
            return `'${val.replace(/'/g,"''")}'`;
        }
    }
    return val;
}

export function DataGrid(props) {
    const {
        table,
        columnInfo,
        rows,        
        getFieldSort,
        doDelete,
    } = props.context;
    const emptyEditData = {
        id: null,
        data: {},
    };
    const [editItemData, setEditItemData] = useState(emptyEditData);
    const resetEditItemData = () => setEditItemData(emptyEditData);
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
                                    if (isEdit) {
                                        const changedCols = columnInfo.fields.map(f => {
                                            const fname = f.fieldName;
                                            if (editItemData.data[fname] !== row[fname]) return fname;
                                        }).filter(x => x);
                                        if (!changedCols.length) {
                                            resetEditItemData();
                                        } else {
                                            const updateSet = changedCols.map(c => `${c}='${editItemData.data[c].replace(/'/g, "''")}'`).join(',');
                                            const whereFieldsPK = columnInfo.indexes.filter(i => i.indexName === 'PRIMARY').map(i => i.columnName).map(name => {
                                                return columnInfo.fields.find(f => f.fieldName === name);
                                            });
                                            const where = (whereFieldsPK.length ?whereFieldsPK:columnInfo.fields).map(f => {
                                                const fname = f.fieldName;
                                                let val = row[fname];
                                                if (f.fieldType === 'date' || f.fieldType === 'datetime') {
                                                    if (!val) val = 'null';
                                                    else {                                                        
                                                        const fmtStr = f.fieldType === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';
                                                        val = `'${moment(val).format(fmtStr)}'`;
                                                    }
                                                }else
                                                if (val !== 0) {
                                                    if (val === '') val = "''";
                                                    else if (!val) val = 'null';
                                                    else {
                                                        val = `'${val}'`;
                                                    }
                                                }
                                                return `${fname}=${val}`;
                                            }).join(' and ');
                                            const updateSql = `update ${table} set ${updateSet} where ${where}`;
                                            console.log('updateSql '+ updateSql);
                                            sqlFreeForm(updateSql).then(() => {
                                                resetEditItemData();
                                            }).catch(err => {
                                                console.log(err);
                                            })
                                        }
                                    } else {
                                        setEditItemData({
                                            id: curId,
                                            data: { ...row },
                                        });
                                    }
                                }}>{isEdit?'Save':'Edit'}</Button>
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