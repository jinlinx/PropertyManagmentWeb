import React, {useState} from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { sqlFreeForm } from '../../api';
import {v1} from 'uuid';
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
        loadData,
    } = props.context;
    const emptyEditData = {
        id: null,
        data: {},
    };
    const [editItemData, setEditItemData] = useState(emptyEditData);
    const [newItemData, setNewItemData] = useState(null);
    const resetEditItemData = () => setEditItemData(emptyEditData);
    const whereFieldsPK = columnInfo.indexes.filter(i => i.indexName === 'PRIMARY').map(i => i.columnName).map(name => {
        return columnInfo.fields.find(f => f.fieldName === name);
    });
    const pkFieldsMap = whereFieldsPK.reduce((acc, w) => {
        acc[w.fieldName] = w;
        return acc;
    }, {});
    const getWhereByRow = row => {
        const where = (whereFieldsPK.length ? whereFieldsPK : columnInfo.fields).map(f => {
            const fname = f.fieldName;
            let val = toSqlVal(f.fieldType, row[fname]);
            return `${fname}=${val}`;
        }).join(' and ');
        return where;
    }
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
                                                });
                                            }
                                        } /></td>    
                                    }
                                    return <td key={find}>{dsp}</td>
                                })
                            }
                            <td>
                                {<Button onClick={() => {
                                    const whereSql = getWhereByRow(row);
                                    sqlFreeForm(`delete from ${table} where ${whereSql}`).then(() => {
                                        loadData();
                                    }).catch(err => {
                                        console.log(err.message);
                                    })
                                }}>Delete</Button>}
                                {<Button onClick={() => {
                                    if (isEdit) {
                                        const changedCols = columnInfo.fields.map(f => {
                                            const fname = f.fieldName;
                                            if (editItemData.data[fname] !== row[fname]) return f;
                                        }).filter(x => x);
                                        if (!changedCols.length) {
                                            resetEditItemData();
                                        } else {
                                            const updateSet = changedCols.map(f => `${f.fieldName}=${toSqlVal(f.fieldType,editItemData.data[f.fieldName])}`).join(',');                                            
                                            const where = getWhereByRow(row);
                                            const updateSql = `update ${table} set ${updateSet} where ${where}`;
                                            console.log('updateSql '+ updateSql);
                                            sqlFreeForm(updateSql).then(() => {
                                                resetEditItemData();
                                                return loadData();
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

            <tr>{
                newItemData && columnInfo.fields.map((f, find) => {
                    const fn = f.fieldName;                    
                    return <td key={find}> <Form.Control as="input" value={newItemData[fn]} onChange={
                        e => {
                            setNewItemData({
                                ...newItemData,
                                [fn]: e.target.value,
                            })
                        }
                    } /></td>
                })
            }
            <td><Button onClick={() => {
                    if (!newItemData) {
                        setNewItemData(columnInfo.fields.reduce((acc, f) => {
                            acc[f] = '';
                            if (pkFieldsMap[f.fieldName]) {
                                acc[f.fieldName] = v1();
                            }
                            return acc;
                        }, {}));
                    } else {
                        const columns = columnInfo.fields.map(f => `${f.fieldName}`).join(',');
                        const values = columnInfo.fields.map(f => `${toSqlVal(f.fieldType, newItemData[f.fieldName])}`).join(',');
                        const insertSql = `insert into ${table} (${columns}) values (${values})`;
                        sqlFreeForm(insertSql).then(() => {
                            setNewItemData(null);
                            loadData();
                        }).catch(err => {
                            console.log(err.message);
                        })
                    }
                }}>{newItemData ? 'Save' : 'Add'}</Button>
                    <Button onClick={() => {
                        setNewItemData(null);
                }}>Cancel</Button>
                </td>
            </tr>
        </tbody>
    </Table>
}