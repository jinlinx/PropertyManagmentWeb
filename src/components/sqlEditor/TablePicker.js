import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button } from 'react-bootstrap';
import { sqlGetTables, sqlFreeForm } from '../api';
import ColumnEditor from './columnEditor';
import LoadingCover from './LoadingCover';
import { DataViewerAuto } from './DataViewer';

function TablePicker() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showData, setShowData] = useState(true);
    const loadTables = setTbl => {
        return sqlGetTables().then(res => {
            setTables(res);
            if (setTbl) {
                setSelectedTable(setTbl);
            }
        });
    }
    useEffect(() => {        
        loadTables();
    }, []);
    const selectTable = tableName => {
        setSelectedTable(tableName);
    }
    return <div>
        {isLoading && <LoadingCover isLoading={isLoading} />}
        <Table striped bordered hover size="sm">
            <tbody>
            <tr>
                    <td>
                        <Table striped bordered hover size="sm">
                            <tbody>
                                {
                                    tables.map((name, key) => <tr key={key}>
                                        <td>
                                            <div style={{ textAlign: 'left', fontWeight: name === selectedTable ? 'bold' : 'normal' }}><a onClick={() => selectTable(name)}>{name}</a></div>
                                        </td>
                                        <td><Button onClick={() => {
                                            setShowData(!showData);
                                        }}>{showData?'Data':'Schema'}</Button></td>
                                    </tr>)
                                }
                                <tr><td><Button onClick={() => {
                                    setSelectedTable(null);
                                }}>Add</Button></td></tr>
                            </tbody>
                        </Table>
                    </td>
                    <td>
                        {
                            (!showData) && <ColumnEditor table={selectedTable} loadTables={loadTables}
                                isLoading={isLoading} setIsLoading={setIsLoading}
                            ></ColumnEditor>
                        }
                        {
                            showData && <DataViewerAuto table={selectedTable}></DataViewerAuto>
                        }
                    </td>
            </tr>
            <tr>                                
                </tr>
            </tbody>
        </Table>
            
    </div>
}


export default TablePicker;