import React, { useState, useEffect } from 'react';
import { sqlGetTableInfo, sqlGetTables } from '../api';
import styles from './TablePicker.css'
import ColumnEditor from './columnEditor';

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
                        <ColumnEditor table={selectedTable}></ColumnEditor>                    
                </td>
                </tr>
            </tbody>
        </table>
            
    </div>
}


export default TablePicker;