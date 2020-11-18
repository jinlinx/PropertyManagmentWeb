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
    return <tr>
        <td>
            Name:<TextInputWithError name='__createConstraintName' stateContext={stateContext}></TextInputWithError>
            <MultiDropdown
                name='constraintIdParts'
                selectedItems={stateContext.getVal('__createConstraintIndexParts') || []}
                setSelectedItems={items => {
                    stateContext.setVal('__createConstraintIndexParts', items);
                }}
                options={tableInfo.fields}
                itemToName={x => x.fieldName}
            />
            <DropdownButton title={curForeignKeyTable} >
                {
                    (allTableInfo.tables.length) ? allTableInfo.tables.map((curTbl, keyId) => {
                        return <Dropdown.Item key={keyId} onSelect={() => {
                            setCurForeignKeyTable(curTbl)
                        }}>{curTbl}</Dropdown.Item>
                    }) : <Dropdown.Item>Loading</Dropdown.Item>
                }
            </DropdownButton>
            <MultiDropdown
                selectedItems={stateContext.getVal('__createConstraintRefTablesCols') || []}
                setSelectedItems={items => {
                    stateContext.setVal('__createConstraintRefTablesCols', items);
                }}
                options={
                    allTableInfo.tableCols[curForeignKeyTable] ? allTableInfo.tableCols[curForeignKeyTable].fields
                        : [{ fieldName: 'Loading' }]
                }
                itemToName={x => x.fieldName}
            />
        </td><td><Button onClick={() => {
            const constraintName = stateContext.getVal('__createConstraintName');
            const refTblCols = stateContext.getVal('__createConstraintRefTablesCols');
            const createConstraintSql = `ALTER TABLE ${table}
ADD CONSTRAINT ${constraintName}
FOREIGN KEY (${stateContext.getVal('__createConstraintIndexParts').map(r => r.fieldName).join(',')}) REFERENCES 
${curForeignKeyTable}(${refTblCols.map(r => r.fieldName).join(',')});`;
            sqlFreeForm(createConstraintSql).then(() => getTableInfo(table))
                .catch(err => {
                    console.log(err);
                })
        }}>Add Constraint</Button></td></tr>
}