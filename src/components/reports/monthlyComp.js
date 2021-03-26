
import React, { useState, useEffect } from 'react';
import { Table, Form, Modal, Dropdown, Button, Toast, InputGroup, Tab } from 'react-bootstrap';
import { sqlGet } from '../api';
import EditDropdown from '../paymentMatch/EditDropdown';
export default function MonthlyComp() {
    const [workers, setWorkers] = useState([]);
    const [errorTxt, setErrorText] = useState('');
    const [curWorker, setCurWorker] = useState({});
    const [monthes, setMonthes] = useState([]);
    const [curMonth, setCurMonth] = useState({});
    const [payments, setPayments] = useState([]);
    const workerToOptin = w => ({
        value: w.workerID,
        label: `${w.firstName} ${w.lastName}`,
    });
    useEffect(() => {
        sqlGet({
            table: 'workerComp',
            fields: ['workerID', 'firstName', 'lastName'],
            groupByArray: [{ 'field': 'workerID' }]
        }).then(res => {
            setWorkers(res.rows);
            if (res.rows.length) {
                const w = res.rows[0];
                setCurWorker(workerToOptin(w));
            }
        }).catch(err => {
            
        });
        
    }, []);
    useEffect(() => {
        sqlGet({
            table: 'maintenanceRecords',
            fields: ['month'],
            whereArray: [{
                field: 'workerID',
                op: '=',
                val: curWorker.value,
            }],
            groupByArray: [{ 'field': 'month' }]
        }).then(res => {
            const rows = res.rows.map(r=>r.month).map(m=>m.substr(0,10));
            rows.sort((a, b) => {
                if (a > b) return -1;
                if (a < b) return 1;
                return 0;
            });
            const m = rows.map(value => ({
                value,
                label: value,
            }));
            setMonthes(m);
            if (m.length) setCurMonth(m[0]);
        })
    }, [curWorker]);
    
    console.log(curMonth);
    useEffect(() => {
        console.log('chaing curmonth ' + curWorker?.value)
        if (!curWorker?.value) return;
        if (!curMonth?.value) return;
        sqlGet({
            table: 'rentPaymentInfo',
            whereArray:[{field:'workerID', op:'=',val: curWorker.value},{field:'month',op:'=',val:curMonth.value}],
        }).then(res => {
            console.log('allPayments');
            console.log(res);
        })
    }, [curMonth.value]);
    return <div style={{display:'flex', flexFlow:'row'}}>
        <Modal show={!!errorTxt}>
            <Modal.Header closeButton>
                <Modal.Title>Error</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>{errorTxt}</p>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setErrorText('')}>Close</Button>
            </Modal.Footer>
        </Modal>
        <div style={{ flex:'1 0 0', order:1}}>
        <EditDropdown context={{
            disabled: false,
            curSelection: curWorker, setCurSelection: setCurWorker, getCurSelectionText: x => x.label || '',
            options: workers.map(workerToOptin), setOptions: () => { },
            loadOptions: () => null,
            }}></EditDropdown>
        </div>
        <div style={{ flexFlow: 'row', flex: '1 0 0', order:1 }}>
        <EditDropdown context={{
            disabled: false,
            curSelection: curMonth, setCurSelection: setCurMonth, getCurSelectionText: x => x.label || '',
            options: monthes, setOptions: () => { },
            loadOptions: () => null,
            }}></EditDropdown>
        </div>
    </div>
}