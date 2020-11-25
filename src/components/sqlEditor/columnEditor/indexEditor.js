import React from 'react';
import { Button, } from 'react-bootstrap';
import { get } from 'lodash';
import { getApiError } from '../../util';
import { TextInputWithError } from '../TextInputWithError';
import { MultiDropdown } from '../MultiBarDropdown';
const { sqlFreeForm } = require('../../api');
export function IndexEditor(props) {
    const {
        stateContext,
        tableInfo,        
        table,
        getTableInfo,
        setIsLoading,
    } = props.context;
    const indexParts = stateContext.getVal('__createIndexParts') || [];
    const curSelIndex = get(indexParts, '0.fieldName') || get(tableInfo, 'fields[0].fieldName', '');

    const hasPrimaryKey = !!(get(tableInfo, 'indexes', [])).filter(i => i.isPrimaryKey).length;
    const indexPartsMap = indexParts.reduce((acc, i) => {
        acc[i] = true;
        return acc;
    }, {}); 

    return <><tr><td>{hasPrimaryKey ? 'Indexes' : 'Primary Key'}</td></tr>
    {
        tableInfo.indexes.reduce((acc, idx) => {
            let cmb = acc.dict[idx.indexName];
            if (!cmb) {
                cmb = {
                    ...idx,
                    columnNames: idx.columnName,
                };
                acc.dict[idx.indexName] = cmb;
                acc.combined.push(cmb);
            } else {
                cmb.columnNames = cmb.columnNames + ',' + idx.columnName;
            }
            return acc;
        }, {
            dict: {},
            combined: [],
        }).combined.map((idx, keyId) => {
            return <tr key={keyId}><td>{idx.indexName}</td><td> {idx.table}</td><td>{idx.columnNames}</td>
                <td><Button onClick={() => {
                    setIsLoading(true);
                    sqlFreeForm(
                        idx.isPrimaryKey ? `alter table ${table} drop primary key` :
                            `alter table ${table} drop index ${idx.indexName}`)
                        .then(() => getTableInfo(idx.table))
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
            <MultiDropdown
                name='CreateIndexMultiDropdown'
                selectedItems={indexParts}
                setSelectedItems={items => {
                    stateContext.setVal('__createIndexName', `${hasPrimaryKey ? 'IDX' : 'PK'}_${table}_${items.join('_')}`);
                    stateContext.setVal('__createIndexParts', items);
                }}
                options={tableInfo.fields.map(f => f.fieldName).filter(f => !indexPartsMap[f])}
                itemToName={x => x}
            />
        </td><td><Button onClick={() => {
            const indexName = stateContext.getVal('__createIndexName');
            const indexParts = stateContext.getVal('__createIndexParts');
            const indexPartsStr = indexParts && indexParts.length ? indexParts.map(i => `${i}`).join(',')
                : curSelIndex;
            const createSql = hasPrimaryKey ? `create index ${indexName} on ${table} (${indexPartsStr})` :
                `alter table ${table} add constraint ${indexName} primary key (${indexPartsStr})`;
            sqlFreeForm(createSql).then(() => getTableInfo(table))
                .catch(err => {
                    console.log(err);
                    stateContext.setErr('__createIndexName', getApiError(err));
                })
            }}>Add Index</Button></td></tr>
        </>
}