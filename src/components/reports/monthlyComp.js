
import React, { useState, useEffect } from 'react';
import { Table, Form, Modal, Dropdown, Button, Toast, InputGroup, Tab } from 'react-bootstrap';
import { sqlGet } from '../api';
import EditDropdown from '../paymentMatch/EditDropdown';

import { orderBy, sumBy } from 'lodash';

export default function MonthlyComp() {
    const [workers, setWorkers] = useState([]);
    const [workerComps, setWorkerComps] = useState({});
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
            //fields: ['workerID', 'firstName', 'lastName'],
            //groupByArray: [{ 'field': 'workerID' }]
        }).then(res => {
            setWorkerComps(res.rows.reduce((acc, wc) => {
                let cmp = acc[wc.workerID];
                if (!cmp) {
                    cmp = [];
                    acc[wc.workerID] = cmp;
                }
                cmp.push(wc);
                return acc;
            }, {}));
            setWorkers(res.rows);
            if (res.rows.length) {
                const w = res.rows[0];
                setCurWorker(workerToOptin(w));
            }
        }).catch(err => {
            
        });       
        
    }, []);
    useEffect(() => {
        if (!curWorker.value) return;
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
            const rows = res.rows.map(r=>r.month).map(m=>m.substr(0,7));
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
        });

        sqlGet({
            table:'maintenanceRecords',
            whereArray: [{
                field: 'workerID',
                op: '=',
                val: curWorker.value,
            }],
        }).then(res=>{
            
        });
    }, [curWorker]);
    
    
    useEffect(() => {
        if (!curWorker?.value) return;
        if (!curMonth?.value) return;
        sqlGet({
            table: 'rentPaymentInfo',
            whereArray:[{field:'workerID', op:'=',val: curWorker.value},{field:'month',op:'=',val:curMonth.value}],
        }).then(res => {
            console.log('allPayments');
            console.log(res.rows);
            setPayments(res.rows);
        })
    }, [curMonth.value]);

    const curWorkerComp = orderBy(workerComps[curWorker.value] || [], ['address'], ['asc']);
    const paymentsByLease = payments.reduce((acc, p) => {
        let lp = acc[p.leaseID];
        if (!lp) {
            lp = {
                total: 0,
                payments: [],
            };
            acc[p.leaseID] = lp;
        }
        lp.total += p.receivedAmount;
        lp.payments.push(p);
        return acc;
    }, {});
    const cmpToLease = cmp => paymentsByLease[cmp.leaseID] || { total: 0 };
    const getCmpAmt = cmp => {
        if (cmp.type === 'percent')
            return cmpToLease(cmp).total*cmp.amount/100;
        return cmp.amount;
    }
    
    const totalToBePaid = sumBy(curWorkerComp.map(getCmpAmt),x=>x);
    return <div style={{display:'flex', height:'100%', flexDirection:'column', boxSizing:'border-box'}}>
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
        <div style={{ display: 'inline-flex', flexShrink:0 }}>
            <div style={{ flex: '1 0 0', order: 1 }}>
                <EditDropdown context={{
                    disabled: false,
                    curSelection: curWorker, setCurSelection: setCurWorker, getCurSelectionText: x => x.label || '',
                    options: workers.map(workerToOptin), setOptions: () => { },
                    loadOptions: () => null,
                }}></EditDropdown>
            </div>
            <div style={{ flexFlow: 'row', flex: '1 0 0', order: 1 }}>
                <EditDropdown context={{
                    disabled: false,
                    curSelection: curMonth, setCurSelection: setCurMonth, getCurSelectionText: x => x.label || '',
                    options: monthes, setOptions: () => { },
                    loadOptions: () => null,
                }}></EditDropdown>
            </div>
        </div>
        
        <div style={{flexGrow:1, overflowY:'auto'}}>
            <Table>
                <thead>
                    <tr><td></td><td>Type</td><td>Address</td>
                    <td>Rent</td><td>Comp</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        curWorkerComp.map(cmp => {
                            const lt = cmpToLease(cmp);
                            return <tr><td>{cmp.amount}</td><td>{cmp.type}</td><td>{cmp.address}</td>
                                <td>{lt.total}</td><td>{ totalToBePaid}</td>
                            </tr>
                        })
                    }
                    {
                        <tr><td>Total</td><td></td><td></td>
                            <td>{
                                sumBy(curWorkerComp.map(cmpToLease),'total')
                            }</td><td>
                                {
                                    totalToBePaid
                                }
                            </td></tr>
                    }
                </tbody>
            </Table>
        </div>
    </div>
}