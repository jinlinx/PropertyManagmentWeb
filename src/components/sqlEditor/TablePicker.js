import React, { useState, useEffect } from 'react';
import { sqlGetTableInfo, sqlGetTables } from '../api';
import styles from './TablePicker.css'
function TablePicker() {
    const [tables, setTables] = useState([]);
    const [tableInfo, setTableInfo] = useState({});
    const [selectedTable, setSelectedTable] = useState('');
    const [newColumnName, setNewColumnName] = useState('');
    const loadTables = () => {
        sqlGetTables().then(res => {
            setTables(res);
        });
    }
    useEffect(() => {        
        loadTables();
    }, []);
    const selectTable = tableName => {
        setSelectedTable(tableName);
        setTableInfo(null);
        sqlGetTableInfo(tableName).then(setTableInfo);
    }
    return <div className={styles.flex_container_col}>
        <table border="1">
            <tbody>
            <tr>
                <td rowSpan="10">
                    <div className={styles.flex_container_col}>
                        {
                            tables.map((name,key) => <div key={key} style={{ textAlign: 'left', fontWeight: name === selectedTable ? 'bold' : 'normal' }}><a onClick={() => selectTable(name)}>{name}</a></div>)
                        }
                    </div>
                </td>
            </tr>
            <tr>                
                <td>
                    <div style={{textAlign:'top', float:'top', border:1, borderWidth:2}}>{selectedTable}</div>
                    {
                            tableInfo && tableInfo.fields && <table border="1">
                                <tbody>
                            <tr><td rowSpan="2">
                                <div className={styles.flex_container_row}>
                                {
                                    //tableInfo.fields.map(f => <div>{f.fieldName}</div>)
                                    tableInfo.fields.map((f,key) => <div key={key}><div style={{float:'left', display:'block'}}>{f.fieldName} {f.fieldType}</div></div>)
                                }
                                    <div style={{ overflow: 'hidden' }}>Name<input value={newColumnName} onChange={e => {
                                        console.log(e.target.value);
                                        setNewColumnName(e.target.value);
                                    }}></input><button>Add</button></div>
                                </div>
                            </td></tr>
                                    <tr><td></td><td></td></tr>
                                </tbody>
                        </table>
                    }
                </td>
                </tr>
            </tbody>
        </table>
            
    </div>
}


export default TablePicker;