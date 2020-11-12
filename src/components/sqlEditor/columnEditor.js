import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup  } from 'react-bootstrap';
import { sqlGetTableInfo, sqlFreeForm } from '../api';
import { get } from 'lodash';
import LoadingCover from './LoadingCover';
import { TextInputWithError, createStateContext } from './TextInputWithError';

function ColumnEditor(props) {
    const defaultColumnTypeVal = { label: 'varchar', value: 'varchar' };
    const { table, loadTables, isLoading, setIsLoading} = props;    
    const isNew = table === null;
    const needQuery = !!table;
    const [tableInfo, setTableInfo] = useState({});
    //const [isLoading, setIsLoading] = useState(false);    

    const stateGetSet = useState({
        values: {},
        errors: {},
    });
    const stateContext = createStateContext(stateGetSet);

    const [newColInfo, setNewColInfo] = useState({
        name: '',
        type: defaultColumnTypeVal,
        selType: 'varchar',
        size: 100,
    });
    const setSelType = selType => {
        setNewColInfo({
            ...newColInfo,
            selType,
        });
    }
    const getTableInfo = (table) => {
        if (table) {
            setIsLoading(true);
            return sqlGetTableInfo(table).then(res => {
                setIsLoading(false);
                setTableInfo({
                    constraints: res.constraints,
                    fields: res.fields.map(f => {
                        const r = f.fieldType.match(/([a-zA-Z]+)(\(([0-9]+){1,1}(,([0-9]+){1,1}){0,1}\)){0,1}/);                        
                        return {
                            ...f,
                            fieldType: r[1],
                            fieldSize: r[3],
                            fieldMinSize: r[5],
                        };
                    }),
                    indexes: res.indexes,
                });
            });
        } else {
            setTableInfo({
                constraints: {},
                fields: [],
                indexes: {},
            });
        }
    }
    useEffect(() => {
        if (needQuery)
            getTableInfo(table);
        else if (isNew) {
            setTableInfo({
                constraints: [],
                fields: [],
                indexes: [],
            });
        }
    }, [table]);    

    const indexParts = stateContext.getVal('__createIndexParts') || [];
    const curSelIndex = get(indexParts,'0.fieldName') || get(tableInfo, 'fields[0].fieldName','');
    
    return <div>
        <LoadingCover isLoading={isLoading}/>
        {            
            (isNew || table) && <Table style={{ 'z-index': 8,}} striped bordered hover size="sm">
                <thead>
                    <tr><td>Name</td><td>Type</td><td>Size</td><td>Action</td></tr>                    
                </thead>
                    {tableInfo && tableInfo.fields && <tbody>
                        {
                            //tableInfo.fields.map(f => <div>{f.fieldName}</div>)
                            tableInfo.fields.map((f, key) => <tr key={key}><td style={{ textAlign: 'left' }}>{f.fieldName}</td><td style={{ textAlign: 'left' }}> {f.fieldType}</td>
                                <td>{f.fieldSize || ''}</td>
                                <td><Button onClick={() => {                                    
                                    if (isNew) {
                                        setTableInfo({
                                            ...tableInfo,
                                            fields: tableInfo.fields.filter(ff => ff.fieldName !== f.fieldName)
                                        })
                                    } else {
                                        setIsLoading(true);
                                        const newTableName = stateContext.getVal('newTableName'); //getVal(stateGetSetVal, 'newTableName');
                                        sqlFreeForm(`alter table ${table} drop column ${f.fieldName};`).then(() => {
                                            return getTableInfo(table || newTableName).then(() => {
                                                setIsLoading(false);
                                            })
                                        });
                                    }
                                }}>Delete</Button></td>
                            </tr>)
                        }
                    <tr><td>
                        <TextInputWithError name='newColName' stateGetSet={stateGetSet} />
                        </td>
                            <td>
                                <DropdownButton title={newColInfo.selType} >
                                    <Dropdown.Item onSelect={() => setSelType('varchar')}>varchar</Dropdown.Item>
                                    <Dropdown.Item onSelect={() => setSelType('datetime')}>datetime</Dropdown.Item>
                                    <Dropdown.Item onSelect={() => setSelType('decimal')}>decimal</Dropdown.Item>
                                </DropdownButton>
                            </td>
                            <td>
                                <Form.Control as="input" value={newColInfo.size} onChange={
                                    e => {
                                        const v = parseInt(e.target.value);
                                        if (isNaN(v)) return;
                                        setNewColInfo({
                                            ...newColInfo,
                                            fieldSize: v,
                                        })
                                    }
                                } />
                            </td>
                            <td>
                            <Button onClick={() => {
                                const newColName = stateContext.getVal('newColName'); //getVal(stateGetSetVal, 'newColName');
                                    if (isNew) {
                                        if (newColName) {
                                            setTableInfo({
                                                ...tableInfo,
                                                fields: tableInfo.fields.concat({
                                                    fieldName: newColName,
                                                    fieldType: newColInfo.selType,
                                                    size: newColInfo.size,
                                                })
                                            })
                                        }
                                    } else {
                                        if (newColName) {
                                            let fieldType = newColInfo.selType;
                                            if (fieldType === 'varchar') {
                                                fieldType = `${fieldType}(${newColInfo.size})`;
                                            }
                                            if (fieldType === 'decimal') {
                                                fieldType = `${fieldType}(${newColInfo.size},2)`;
                                            }
                                            setIsLoading(true);
                                            sqlFreeForm(`alter table ${table} add column ${newColName} ${fieldType};`).then(() => {
                                                return getTableInfo(table).then(() => {                                                    
                                                    setIsLoading(false);
                                                    stateContext.setErr('newColName', '');
                                                });
                                            }).catch(err => {
                                                const message = get(err, 'response.body.message', err.message);
                                                //setStateGetSetVal(setErr(stateGetSetVal, 'newColName', message));
                                                stateContext.setErr('newColName', message);
                                                setIsLoading(false);
                                            });
                                        }
                                    }
                                }}>Add</Button>
                            </td>
                        </tr>
                    {
                        isNew && <tr><td>
                            <TextInputWithError name="newTableName" stateGetSet={ stateGetSet}/>

                            <Button onClick={() => {
                            const colDefs = tableInfo.fields.map(f => {
                                let fieldType = f.fieldType;
                                if (fieldType === 'varchar') {
                                    fieldType = `${fieldType}(${f.size})`;
                                }
                                if (fieldType === 'decimal') {
                                    fieldType = `${fieldType}(${f.size},2)`;
                                }
                                return `${f.fieldName} ${fieldType}`;
                            }).join(',');
                                const newTableName = stateContext.getVal('newTableName'); //getVal(stateGetSetVal, 'newTableName');
                                sqlFreeForm(`create table ${newTableName} (${colDefs})`).then(() => {
                                    return getTableInfo(newTableName).then(() => {
                                        return loadTables(newTableName).then(() => {
                                            setIsLoading(false);
                                        });
                                    })
                                }).catch(err => {
                                    setIsLoading(false);
                                    const message = get(err, 'response.body.message', err.message);
                                    console.log(err);
                                    //setStateGetSetVal(setErr(stateGetSetVal, 'newTableName', get(err, 'response.body.message', err.message)))                                
                                    stateContext.setErr('newTableName',message)
                                });
                        }}>Create</Button></td></tr>
                    }
                    {
                        !isNew && <tr><td><Button onClick={() => {
                            setIsLoading(true);
                            sqlFreeForm(`drop table ${table}`).then(() => {
                                return loadTables().then(() => {
                                    setIsLoading(false);
                                    getTableInfo();
                                });
                            }).catch(err => {
                                setIsLoading(false);
                                console.log(err);
                            })
                        }}>Delete</Button></td></tr>
                    }
                    <tr><td>Indexes</td></tr>
                    {
                        tableInfo.indexes.map(idx => {
                            return <tr><td>{idx.indexName}</td><td> {idx.table}</td><td>{idx.columnName}</td>
                                <td><Button onClick={() => {
                                    setIsLoading(true);
                                    sqlFreeForm(`alter table ${table} drop index ${idx.indexName}`).then(()=>getTableInfo(idx.table))
                                        .then(() => {
                                            setIsLoading(false);
                                        })
                                        .catch(err => {
                                            setIsLoading(false);
                                            console.log(err);
                                        })
                                }}>Delete</Button></td>
                            </tr>
                        })
                    }
                    <tr>                        
                        <td>
                            <TextInputWithError name='__createIndexName' stateGetSet={stateGetSet}></TextInputWithError>
                            <DropdownButton title={ curSelIndex } >
                                {
                                    tableInfo.fields.map(f => {
                                        return <Dropdown.Item onSelect={() => {                                            
                                            stateContext.setVal('__createIndexParts', [{
                                                fieldName: f.fieldName
                                            }]);
                                        }}>{f.fieldName}</Dropdown.Item>        
                                    })
                                }
                                <Dropdown.Item onSelect={() => setSelType('varchar')}>varchar</Dropdown.Item>
                                <Dropdown.Item onSelect={() => setSelType('datetime')}>datetime</Dropdown.Item>
                                <Dropdown.Item onSelect={() => setSelType('decimal')}>decimal</Dropdown.Item>
                            </DropdownButton>
                    </td><td><Button onClick={() => {    
                            const indexName = stateContext.getVal('__createIndexName');
                            const indexParts = stateContext.getVal('__createIndexParts');
                            const indexPartsStr = indexParts && indexParts.length ? indexParts.map(i => `${i.fieldName}`).join(',')
                                : curSelIndex;
                            sqlFreeForm(`create index ${indexName} on ${table} (${indexPartsStr})`).then(() => getTableInfo(table))
                                .catch(err => {
                                    console.log(err);
                            })
                    }}>Add Index</Button></td></tr>
                    </tbody>
                    }
                </Table>
            }
    </div>
}


export default ColumnEditor;