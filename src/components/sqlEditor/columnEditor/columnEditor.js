import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup } from 'react-bootstrap';
import { sqlGetTableInfo, sqlGetTables, sqlFreeForm } from '../../api';
import { get } from 'lodash';
import LoadingCover from '../LoadingCover';
import { TextInputWithError, createStateContext } from '../TextInputWithError';
import { apiGetTableInfo } from '../apiUtil';
import { ConstraintsEditor } from './constraints';
import { IndexEditor } from './indexEditor';
function ColumnEditor(props) {
    const defaultColumnTypeVal = { label: 'varchar', value: 'varchar' };
    const { table, loadTables, isLoading, setIsLoading } = props;    
    const isNew = table === null;    
    const [tableInfo, setTableInfo] = useState({});
    const [allTableInfo, setAllTableInfo] = useState({
        tables: [],
        tableCols: {},
    });
    
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
        fieldSize: 100,
    });
    const setSelType = selType => {
        setNewColInfo({
            ...newColInfo,
            selType,
            fieldSize: getTypeDefaultSize(selType),
        });
    }

    const getTableInfoAndPopulateForeignKeyTable = async (table, force=false) => {
        const existing = allTableInfo.tableCols[table];
        if (existing && !force) return existing;
        return await apiGetTableInfo(table).then(otinf => {
            const tinf = {
                ...otinf,
                indexes: otinf.indexes.map(f => {
                    return {
                        ...f,
                        isPrimaryKey: f.indexName === 'PRIMARY'
                   } 
                }),
            }
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
                constraints: [], //columnName: "id", constraintName: "fk_test_2" ,refColumn: "tenantID" ,refTable: "tenantInfo"
                fields: [],
                indexes: [],
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

    const getTypeSizeFields = fieldType => {
        if (fieldType === 'varchar') {
            return 1;
        }
        if (fieldType === 'decimal') {
            return 2;
        }
        return 0;
    }
    const getTypeDefaultSize = fieldType => {
        if (fieldType === 'varchar') {
            return 100;
        }
        if (fieldType === 'decimal') {
            return 12;
        }
    }

    const hasPrimaryKey = !!(get(tableInfo, 'indexes', [])).filter(i => i.isPrimaryKey).length;
    const indexParts = stateContext.getVal('__createIndexParts') || [];
    const curSelIndex = get(indexParts, '0.fieldName') || get(tableInfo, 'fields[0].fieldName', '');    
    const indexPartsMap = indexParts.reduce((acc, i) => {
        acc[i] = true;
        return acc;
    }, {}); 
    return <div>
        <LoadingCover isLoading={isLoading}/>
        {            
            (isNew || table) && <Table striped bordered hover size="sm">
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
                                <Dropdown.Item onSelect={() => setSelType('date')}>date</Dropdown.Item>
                                <Dropdown.Item onSelect={() => setSelType('decimal')}>decimal</Dropdown.Item>
                                <Dropdown.Item onSelect={() => setSelType('INT')}>INT</Dropdown.Item>
                                <Dropdown.Item onSelect={() => setSelType('BIGINT')}>BIGINT</Dropdown.Item>
                                <Dropdown.Item onSelect={() => setSelType('FLOAT')}>FLOAT</Dropdown.Item>
                                <Dropdown.Item onSelect={() => setSelType('SMALLINT')}>SMALLINT</Dropdown.Item>
                                <Dropdown.Item onSelect={() => setSelType('TINYINT')}>TINYINT</Dropdown.Item>
                                </DropdownButton>
                            </td>
                            <td>
                            {getTypeSizeFields(newColInfo.selType) > 0 && <Form.Control as="input" value={newColInfo.fieldSize} onChange={
                                e => {
                                    const v = parseInt(e.target.value);
                                    if (isNaN(v)) return;
                                    setNewColInfo({
                                        ...newColInfo,
                                        fieldSize: v,
                                    })
                                }
                            } />
                            }
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
                                                    size: newColInfo.fieldSize,
                                                })
                                            })
                                        }
                                    } else {
                                        if (newColName) {
                                            let fieldType = newColInfo.selType;
                                            const sizeFieldLen = getTypeSizeFields(fieldType);
                                            if (sizeFieldLen === 1) {
                                                fieldType = `${fieldType}(${newColInfo.fieldSize})`;
                                            }
                                            if (sizeFieldLen === 2) {
                                                fieldType = `${fieldType}(${newColInfo.fieldSize},2)`;
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
                    {
                        !isNew && <IndexEditor context={ 
                            {
                                stateContext,
                                tableInfo,
                                table,
                                getTableInfo,
                                setIsLoading,
                            }
                        }/>
                    }                                                                                                
                    {
                        !isNew && <ConstraintsEditor context={
                            {
                                stateContext,
                                tableInfo,
                                allTableInfo,
                                curForeignKeyTable,
                                setCurForeignKeyTable,
                                table,
                                getTableInfo,
                            }
                        }></ConstraintsEditor>
                    }
                    </tbody>
                    }
                </Table>
            }
    </div>
}


export default ColumnEditor;