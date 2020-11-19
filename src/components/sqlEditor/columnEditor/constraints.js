import React from 'react';
import { DropdownButton, Dropdown, Button,  } from 'react-bootstrap';
import { sqlFreeForm } from '../../api';
import { TextInputWithError, createStateContext } from '../TextInputWithError';
import { MultiDropdown } from '../MultiBarDropdown';
export function ConstraintsEditor(props) {
    const {
        stateContext,
        tableInfo,
        allTableInfo,
        curForeignKeyTable,
        setCurForeignKeyTable,
        table,
        getTableInfo,
    } = props.context;
    const selectedConstraintCols = stateContext.getVal('__createConstraintColParts') || [];
    const refTblCols = stateContext.getVal('__createConstraintRefTablesCols') || [];
    const setConstraintName = check => {
        const existing = {
            selectedConstraintCols,
            refTblCols,
            curForeignKeyTable,
        }
        const dc = name => check[name] || existing[name] || [];
        stateContext.setVal('__createConstraintName', `FK_${table}_${dc('selectedConstraintCols').join('_')}_${check.curForeignKeyTable || existing.curForeignKeyTable}_${dc('refTblCols').join('_')}`)
    };
    return <tr>
        <td>
            Name:<TextInputWithError name='__createConstraintName' stateContext={stateContext}></TextInputWithError>
            <MultiDropdown
                name='constraintIdParts'
                selectedItems={selectedConstraintCols}
                setSelectedItems={items => {
                    stateContext.setVal('__createConstraintColParts', items);
                    setConstraintName({
                        selectedConstraintCols: items,
                    });
                }}
                options={tableInfo.fields.map(f => f.fieldName).filter(n => !selectedConstraintCols.includes(n))}
            />
            <DropdownButton title={curForeignKeyTable} >
                {
                    (allTableInfo.tables.length) ? allTableInfo.tables.map((curTbl, keyId) => {
                        return <Dropdown.Item key={keyId} onSelect={() => {
                            setCurForeignKeyTable(curTbl);
                            setConstraintName({
                                curForeignKeyTable: curTbl,
                            });
                        }}>{curTbl}</Dropdown.Item>
                    }) : <Dropdown.Item>Loading</Dropdown.Item>
                }
            </DropdownButton>
            <MultiDropdown
                selectedItems={stateContext.getVal('__createConstraintRefTablesCols') || []}
                setSelectedItems={items => {
                    stateContext.setVal('__createConstraintRefTablesCols', items);
                    setConstraintName({
                        refTblCols: items,
                    });
                }}
                options={
                    allTableInfo.tableCols[curForeignKeyTable] ?
                        allTableInfo.tableCols[curForeignKeyTable].fields.map(f => f.fieldName).filter(n => !refTblCols.includes(n))
                        : []
                }
            />
        </td><td><Button onClick={() => {
            const constraintName = stateContext.getVal('__createConstraintName');            
            const createConstraintSql = `ALTER TABLE ${table}
ADD CONSTRAINT ${constraintName}
FOREIGN KEY (${selectedConstraintCols.join(',')}) REFERENCES 
${curForeignKeyTable}(${refTblCols.join(',')});`;
            sqlFreeForm(createConstraintSql).then(() => getTableInfo(table))
                .catch(err => {
                    console.log(err);
                })
        }}>Add Constraint</Button></td></tr>
}