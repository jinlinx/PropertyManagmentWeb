import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup  } from 'react-bootstrap';
import { sqlGetTableInfo, sqlGetTables, sqlFreeForm } from '../api';
import { get } from 'lodash';
import LoadingCover from './LoadingCover';
import { TextInputWithError, createStateContext } from './TextInputWithError';
import { apiGetTableInfo} from './apiUtil';

function ColumnEditor(props) {
    const defaultColumnTypeVal = { label: 'varchar', value: 'varchar' };
    const { table, loadTables, isLoading, setIsLoading } = props;    
    console.log(`ColumnEditor table => ${table}`);
    const isNew = table === null;    
    const [tableInfo, setTableInfo] = useState({});
    const [allTableInfo, setAllTableInfo] = useState({
        tables: [],
        tableCols: {},
    });
    const needQuery = !!table && !allTableInfo.tableCols[table];
    const [curForeignKeyTable, setCurForeignKeyTable] = useState('');
    //const [isLoading, setIsLoading] = useState(false);    

    const stateContext = createStateContext(useState({
        values: {},
        errors: {},
    }));

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

    const getTableInfoAndPopulateForeignKeyTable = async (table, force=false) => {
        const existing = allTableInfo.tableCols[table];
        if (existing && !force) return existing;
        return await apiGetTableInfo(table).then(tinf => {
            const newAllTableInfo = {
                ...allTableInfo,
                tableCols: {
                    ...allTableInfo.tableCols,
                    [table]: tinf,
                }
            }            
            if (!allTableInfo.tables.length) {
                return sqlGetTables().then(res => {
                    setAllTableInfo({
                        ...newAllTableInfo,
                        tables: res,
                    });
                    return tinf;
                });
            }
            setAllTableInfo(newAllTableInfo);
            return tinf;
        })            
    }
    const getTableInfo = (table) => {        
        if (table) {
            setIsLoading(true);
            return getTableInfoAndPopulateForeignKeyTable(table, true).then(tinf => {
                setIsLoading(false);
                setTableInfo(tinf);
            })            
        } else {
            setTableInfo({
                constraints: {},
                fields: [],
                indexes: {},
            });
        }
    }
    useEffect(() => {        
        if (curForeignKeyTable && !allTableInfo.tableCols[curForeignKeyTable]) {
            getTableInfoAndPopulateForeignKeyTable(curForeignKeyTable);
        }
        if (!!table) {
            const existing = allTableInfo.tableCols[table];
            if (existing) {
                setTableInfo(existing);
            }else
                getTableInfo(table);
        }else if (isNew) {
            setTableInfo({
                constraints: [],
                fields: [],
                indexes: [],
            });
        }
    }, [table, curForeignKeyTable]);    

    const indexParts = stateContext.getVal('__createIndexParts') || [];
    const curSelIndex = get(indexParts,'0.fieldName') || get(tableInfo, 'fields[0].fieldName','');
    
    const getStateContextLastAryData = (name, path, defVal) => {
        const parts = stateContext.getVal(name);
        if (!parts) return defVal;
        return get(parts, [parts.length - 1, path], defVal);
    }
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
                        <TextInputWithError name='newColName' stateContext={stateContext} />
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
                            <TextInputWithError name="newTableName" stateContext={ stateContext}/>

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
                    <tr><td>Primary Key</td></tr>
                    {
                        tableInfo.indexes.map(idx => {
                            return <tr><td>{idx.indexName}</td><td> {idx.table}</td><td>{idx.columnName}</td>
                                <td><Button onClick={() => {
                                    setIsLoading(true);
                                    sqlFreeForm(`alter table ${table} drop index ${idx.indexName}`).then(() => getTableInfo(idx.table))
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
                            <TextInputWithError name='__createPrimaryKeyName' stateContext={stateContext}></TextInputWithError>
                            <DropdownButton title={curSelIndex} >
                                {
                                    tableInfo.fields.map(f => {
                                        return <Dropdown.Item onSelect={() => {
                                            stateContext.setVal('__createPrimarykeyParts', [{
                                                fieldName: f.fieldName
                                            }]);
                                        }}>{f.fieldName}</Dropdown.Item>
                                    })
                                }                                
                            </DropdownButton>
                        </td><td><Button onClick={() => {
                            const pkName = stateContext.getVal('__createPrimaryKeyName') || `PK_${table}`;
                            const indexParts = stateContext.getVal('__createPrimarykeyParts');
                            const indexPartsStr = indexParts && indexParts.length ? indexParts.map(i => `${i.fieldName}`).join(',')
                                : curSelIndex;
                            sqlFreeForm(`alter table ${table} add constraint ${pkName} primary key (${indexPartsStr})`).then(() => getTableInfo(table))
                                .catch(err => {
                                    console.log(err);
                                })
                        }}>Add Primary Key</Button></td></tr>
                    <tr><td>Indexes</td></tr>
                    {
                        tableInfo.indexes.map(idx => {
                            return <tr><td>{idx.indexName}</td><td> {idx.table}</td><td>{idx.columnName}</td>
                                <td><Button onClick={() => {
                                    setIsLoading(true);
                                    const dropIdx = idx.indexName === 'PRIMARY' ?
                                        `alter table ${table} drop primary key;`
                                        : `alter table ${table} drop index ${idx.indexName}`;
                                    sqlFreeForm(dropIdx).then(()=>getTableInfo(idx.table))
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
                            <TextInputWithError name='__createIndexName' stateContext={stateContext}></TextInputWithError>
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
                    
                    <tr><td>Constraints</td></tr>
                    {
                        tableInfo.constraints.map(idx => {
                            return <tr><td>{idx.indexName}</td><td> {idx.table}</td><td>{idx.columnName}</td>
                                <td><Button onClick={() => {
                                    setIsLoading(true);
                                    const dropIdx = idx.indexName === 'PRIMARY' ?
                                        `alter table ${table} drop primary key;`
                                        : `alter table ${table} drop index ${idx.indexName}`;
                                    sqlFreeForm(dropIdx).then(() => getTableInfo(idx.table))
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
                            <TextInputWithError name='__createConstraintName' stateContext={stateContext}></TextInputWithError>
                            <DropdownButton title={getStateContextLastAryData('__createConstraintIndexParts','fieldName','')} >
                                {
                                    tableInfo.fields.map(f => {
                                        return <Dropdown.Item onSelect={() => {
                                            stateContext.setVal('__createConstraintIndexParts', [{
                                                fieldName: f.fieldName
                                            }]);
                                        }}>{f.fieldName}</Dropdown.Item>
                                    })
                                }                                
                            </DropdownButton>
                            <DropdownButton title={curForeignKeyTable} >
                                {
                                    (allTableInfo.tables.length) ? allTableInfo.tables.map(curTbl => {
                                        return <Dropdown.Item onSelect={() => {
                                            setCurForeignKeyTable(curTbl)
                                        }}>{curTbl}</Dropdown.Item>
                                    }) : <Dropdown.Item>Loading</Dropdown.Item>
                                }
                            </DropdownButton>
                            <DropdownButton title={getStateContextLastAryData('__createConstraintRefTablesCols','fieldName','')} >
                                {
                                    (allTableInfo.tableCols[curForeignKeyTable]) ? allTableInfo.tableCols[curForeignKeyTable].fields.map(f => {
                                        return <Dropdown.Item onSelect={() => {
                                            stateContext.setVal('__createConstraintRefTablesCols', [{
                                                fieldName: f.fieldName
                                            }]);
                                        }}>{f.fieldName}</Dropdown.Item>
                                    }) : <Dropdown.Item>Loading</Dropdown.Item>
                                }
                            </DropdownButton>
                        </td><td><Button onClick={() => {
                            const constraintName = stateContext.getVal('__createConstraintName');
                            const refTblCols = stateContext.getVal('__createConstraintRefTablesCols');
                            const createConstraintSql = `ALTER TABLE ${table}
ADD CONSTRAINT ${constraintName}
FOREIGN KEY (${stateContext.getVal('__createConstraintIndexParts').map(r => r.fieldName).join(',')}) REFERENCES 
${curForeignKeyTable}(${refTblCols.map(r=>r.fieldName).join(',')});`;
                            sqlFreeForm(createConstraintSql).then(() => getTableInfo(table))
                                .catch(err => {
                                    console.log(err);
                                })
                        }}>Add Constraint</Button></td></tr>
                    </tbody>
                    }
                </Table>
            }
    </div>
}


export default ColumnEditor;