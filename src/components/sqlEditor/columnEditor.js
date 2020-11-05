import React, { useState, useEffect } from 'react';
import Select from 'react-dropdown-select';
import { sqlGetTableInfo, sqlGetTables } from '../api';
function ColumnPicker(props) {
    const defaultColumnTypeVal = { label: 'varchar', value: 'varchar' };
    const { isNew, table } = props;    
    const [tableInfo, setTableInfo] = useState({});    
    const [newColInfo, setNewColInfo] = useState({
        name: '',
        type: defaultColumnTypeVal,
        size: 100,
    });
    const getTableInfo = () => {
        if (table)
            sqlGetTableInfo(table).then(setTableInfo);
    }
    useEffect(() => {
        if (!isNew)
            getTableInfo();
    }, [table]);    
    return <div>
            {
            tableInfo && tableInfo.fields && <table border="1">
                <thead>
                    <tr><td>Name</td><td>Type</td><td>Size</td></tr>
                </thead>
                    <tbody>                                                
                        {                        
                            //tableInfo.fields.map(f => <div>{f.fieldName}</div>)
                            tableInfo.fields.map((f, key) => <tr key={key}><td style={{ textAlign: 'left' }}>{f.fieldName}</td><td style={{ textAlign: 'left' }}> {f.fieldType}</td></tr>)
                        }
                        <tr><td>                        
                                <input value={newColInfo.name} onChange={e => {
                                    setNewColInfo({
                                        ...newColInfo,
                                        name: e.target.value
                                    });
                                }}></input>
                            </td>                                
                                <td>
                                    
                                    <Select
                                            options={[
                                                defaultColumnTypeVal,
                                                { label: 'datetime', value: 'datetime' }
                                            ]}
                                            values={[newColInfo.type]}
                                            onChange={e => {
                                                setTableInfo({
                                                    ...newColInfo,
                                                    type: e[0],
                                                });
                                            }}
                                        >
                                    </Select>                                     
                                </td>
                        <td><input value={newColInfo.size} onChange={e => {
                            const v = parseInt(e.target.value);
                            if (isNaN(v)) return;
                            setNewColInfo({
                                ...newColInfo,
                                size: v,
                                    })
                                }}></input></td>                            
                           </tr>
                        
                    </tbody>
                </table>
            }
    </div>
}


export default ColumnPicker;