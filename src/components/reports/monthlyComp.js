
import React, { useState, useEffect } from 'react';
import { Table, Modal, Button, Container, Row, Col} from 'react-bootstrap';
import { sqlGet } from '../api';
import EditDropdown from '../paymentMatch/EditDropdown';

import { orderBy, sumBy, uniqBy } from 'lodash';
import moment from 'moment';

import { doCalc } from './utils/monthlyCompUtil';

export default function MonthlyComp() {
    //const { ownerInfo} = props.compPrm;
    const [workers, setWorkers] = useState([]);
    const [workerComps, setWorkerComps] = useState({});
    const [errorTxt, setErrorText] = useState('');
    const [curWorker, setCurWorker] = useState({});
    const [monthes, setMonthes] = useState([]);
    const [curMonth, setCurMonth] = useState({});
    const [payments, setPayments] = useState([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [showDetails, setShowDetails] = useState({});
    const workerToOptin = w => ({
        value: w.workerID,
        label: `${w.firstName} ${w.lastName}`,
    });
    //load comp params
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
            
            setWorkers(uniqBy(res.rows,x=>x.workerID));
            if (res.rows.length) {
                const w = res.rows[0];
                setCurWorker(workerToOptin(w));
            }
            sqlGet({
                table: 'maintenanceRecords',
                fields: ['workerID', 'workerFirstName', 'workerLastName'],
                groupByArray: [{ 'field': 'workerID' }]
            }).then(resMW => {
                const resMWWkr = uniqBy(resMW.rows.map(r => {
                    return {
                        workerID: r.workerID,
                        firstName: r.workerFirstName,
                        lastName: r.workerLastName,
                    }
                }), x => x.workerID);
                console.log(resMWWkr)
                setWorkers(uniqBy(res.rows.concat(resMWWkr),'workerID'))
            });
        }).catch(err => {
            
        });       
        
    }, []);
    //load aggregated months
    useEffect(() => {
        if (!curWorker.value) return;
        sqlGet({
            table: 'maintenanceRecords',
            fields: ['month'],
            whereArray: [{
                field: 'workerID',
                op: '=',
                val: curWorker.value,
            }            
        ],
            groupByArray: [{ 'field': 'month' }]
        }).then(res => {
            let rows = res.rows.map(r=>r.month).map(m=>m.substr(0,7));            
            
            sqlGet({
                table: 'rentPaymentInfo',
                fields: ['month'],
                whereArray: [{ field: 'workerID', op: '=', val: curWorker.value }],
                groupByArray: [{ 'field': 'month' }]
            }).then(paymentMonthes => {
                let mrows = uniqBy(paymentMonthes.rows.map(r => r.month).concat(rows), x => x);
                mrows = orderBy(mrows, [x => x], ['desc']);
                console.log(mrows);
                console.log('payment monthes')
                const m = mrows.map(value => ({
                    value,
                    label: value,
                }));
                setMonthes(m);
                if (m.length) setCurMonth(m[0]);
            })
        });
    }, [curWorker]);
    
    
    useEffect(() => {
        if (!curWorker?.value) return;
        if (!curMonth?.value) return;
        sqlGet({
            table: 'rentPaymentInfo',
            whereArray:[{field:'workerID', op:'=',val: curWorker.value},{field:'month',op:'=',val:curMonth.value}],
        }).then(res => {
            setPayments(res.rows.filter(r => r.includeInCommission !== '0'));
        })

        sqlGet({
            table:'maintenanceRecords',
            whereArray: [{
                field: 'workerID',
                op: '=',
                val: curWorker.value,
            },{field:'month',op:'=',val:curMonth.value}],
        }).then(res=>{
            const rows = orderBy(res.rows,['date']);
            setMaintenanceRecords(rows);
        })
    }, [curMonth.value]);

    const curWorkerCompTops = workerComps[curWorker.value] || [];
    const curWorkerCompTop = curWorkerCompTops[0];
    const {
        curWorkerComp,
        totalEarned,
        monthlyCompRes,
        maintenanceRecordsByExpCat,
        generateCsv,
        cmpToLease,
        getCmpAmt,
    } = doCalc({
        curWorkerCompTop,
        payments,
        maintenanceRecords,
    })
    
    
    //const totalEarned = sumBy(curWorkerComp.map(getCmpAmt),x=>x);
    const csvContent = generateCsv(curMonth?.value);
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
            <div>
                <Button onClick={() => {                    
                    var link = document.createElement("a");
                    link.href = window.URL.createObjectURL(
                        new Blob([csvContent.map(c => c.join(', ')).join('\n')], { type: "application/txt" })
                    );
                    link.download = `report-${curMonth?.value}.csv`;

                    document.body.appendChild(link);

                    link.click();
                    setTimeout(function () {
                        window.URL.revokeObjectURL(link);
                    }, 200);
                    
                }}>CSV</Button>
            </div>
        </div>
        
        {
            true && <div>
                <Table>
                {
                        csvContent.map((csvLine, key) => {
                        
                            return key === 0 ?
                                <thead key={key}>
                                    <tr>
                                    {
                                            csvLine.map((itm, key) => <td key={key}><b>{itm}</b></td>)
                                        }
                                    </tr>
                                </thead>
                                :
                                <tr key={key}>
                                    {
                                        csvLine.map((itm, key) => <td key={key}>{itm}</td>)
                                    }
                                </tr>
                        })
                    }
                </Table>
            </div>
        }        
    </div>
}