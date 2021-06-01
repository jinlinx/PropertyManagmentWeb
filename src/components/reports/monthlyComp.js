
import React, { useState, useEffect } from 'react';
import { Table, Modal, Button, } from 'react-bootstrap';
import { sqlGet } from '../api';
import EditDropdown from '../paymentMatch/EditDropdown';

import { orderBy, sumBy, uniqBy } from 'lodash';
import moment from 'moment';

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
            setPayments(res.rows.filter(r=>r.isIncome !== '0'));
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

    const curWorkerComp = orderBy(workerComps[curWorker.value] || [], ['address'], ['asc']);
    const paymentsByLease = payments.reduce((acc, p) => {
        let lp = acc[p.houseID];
        if (!lp) {
            lp = {
                total: 0,
                payments: [],
            };
            acc[p.houseID] = lp;
        }
        lp.total += p.receivedAmount;
        lp.payments.push(p);
        return acc;
    }, {});
    const cmpToLease = cmp => paymentsByLease[cmp.houseID] || { total: 0, payments:[] };
    const getCmpAmt = cmp => {
        if (cmp.type === 'percent')
            return cmpToLease(cmp).total*cmp.amount/100;
        return cmp.amount;
    }
    
    const totalEarned = sumBy(curWorkerComp.map(getCmpAmt),x=>x);
    const maintenanceRecordsByExpCat = maintenanceRecords.reduce((acc, r)=>{
        let cat = acc.byCat[r.expenseCategoryName];
        if (!cat) {
            cat = {
                id: r.expenseCategoryId,
                name: r.expenseCategoryName,
                reimburse: r.expenseCategoryName !== 'Commission Fee',
                total: 0,
                items: [],                
            };
            acc.byCat[r.expenseCategoryName] = cat;
            acc.cats.push(cat);
        }
        cat.total += r.amount;
        if (cat.reimburse) {
            acc.total += r.amount;
        }
        cat.items.push(r);
        return acc;
    },{
        total: 0,
        byCat: {},
        cats: [],
    });
    maintenanceRecordsByExpCat.cats = orderBy(maintenanceRecordsByExpCat.cats,['expCatDisplayOrder']);
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
                    
                    const rows = curWorkerComp.map((cmp, key) => {
                        const lt = cmpToLease(cmp);
                        if (!lt.payments.length) return;
                        return {
                            address: cmp.address,
                            paymentAmount: lt.total,
                            comp: getCmpAmt(cmp).toFixed(2),
                            details: lt.payments.map(pmt => ({
                                date: moment(pmt.receivedDate).format('YYYY-MM-DD'),
                                paidBy: pmt.paidBy,
                                amount: pmt.receivedAmount,
                                desc: pmt.notes,
                            }))
                        }
                    }).filter(x=>x);
                    const res = {
                        totalPayments: sumBy(curWorkerComp.map(cmpToLease), 'total').toFixed(2),
                        totalPaymentComp: totalEarned.toFixed(2),
                        paymentRows: rows,
                        paymentsFlattened: rows.reduce((acc, r,i) => {
                            const drs = r.details.map(rd => {
                                return {
                                    date: rd.date,
                                    amount: rd.amount,
                                    address: r.address,
                                    comp: `c-${i}-${r.comp}`,
                                }
                            });
                            //drs.push({
                            //    date: '-',
                            //    amount: r.paymentAmount,
                            //    address: '-',
                            //    comp: r.comp,
                            //})
                            return acc.concat(drs);
                        }, []),
                    }

                    const reimbusements = maintenanceRecordsByExpCat.cats.map((mr, key) => {
                        if (!mr.reimburse) return;
                        return {
                            name: mr.name,
                            amount: mr.total,
                            rows: mr.items.map(itm => {
                                return {
                                    amount: itm.amount,
                                    address: itm.address,
                                    date: moment(itm.date).format('YYYY-MM-DD'),
                                    desc: itm.description
                                }
                            })
                        }
                    }).filter(x => x);
                    
                    const reimbusementsFlattened = reimbusements.reduce((acc, r) => {
                        const drs = r.rows.map(rr => {
                            return {
                                date: rr.date,
                                name: r.name,
                                amount: rr.amount,
                                address: rr.address,
                                desc: rr.desc,
                            }
                        });
                        //drs.push({
                        //    date: '-',
                        //    name: r.name,
                        //    amount: r.amount,
                        //    address: '-',
                        //    desc:'-'
                        //})
                        acc= acc.concat(drs)
                        return acc;
                    },[]);
                    const reimbusementTotal = maintenanceRecordsByExpCat.total.toFixed(2);
                    res.reimbusements = reimbusements;
                    res.reimbusementTotal = reimbusementTotal;
                    res.totalToBePaid = (totalEarned + maintenanceRecordsByExpCat.total).toFixed(2);

                    const doPad = true;
                    const padRight = (s, len,i) => doPad ? (s || '').toString().padEnd(len) : s;                        
                    const csvHeader = ['Received Date', 'Received Amount', 'Comp        ',
                        'Address               ',
                        '      ', 'Date      ', 'Category             ',
                        'Address               ',
                        'Amount      ', 'Description                                                '];
                    
                    const colWidths = csvHeader.map(c => c.length);


                    const cmpiMapper = [x => x.date, x => x.amount, x => x.comp, x => x.address, x => ''];
                    const rembiMapper = [x => x.date, x => x.name, x => x.address, x => x.amount, x => x.desc];
                    const csvContent = [csvHeader];
                    for (let i = 0; ; i++) {
                        const cmpi = res.paymentsFlattened[i];
                        const curLine = cmpiMapper.map(()=>'');
                        if (cmpi) {
                            for (let j = 0; j < cmpiMapper.length; j++) {
                                curLine[j] = cmpiMapper[j](cmpi);
                            }
                        }
                        const rembi = reimbusementsFlattened[i];
                        if (rembi) {
                            for (let j = 0; j < rembiMapper.length; j++) {
                                const curCol = j + cmpiMapper.length;                                
                                curLine[curCol] = rembiMapper[j](rembi);
                            }
                        }
                        if (!cmpi && !rembi) break;
                        csvContent.push(curLine.map((l,i)=>padRight(l,colWidths[i],i)));
                    }

                    csvContent.push([]);
                    let summary = [
                        ['Total', res.totalPayments],
                        ['Comp', res.totalPaymentComp, '', '', '', '', 'Total', res.reimbusementTotal],
                        [`Total of ${curMonth?.value}`,res.totalToBePaid]
                    ]
                    summary.forEach(s => {
                        s = s.map((itm, i) => {
                            return padRight(itm, colWidths[i]);
                        });
                        csvContent.push(s);
                    })
                    console.log(csvContent)

                    var link = document.createElement("a");
                    link.href = window.URL.createObjectURL(
                        new Blob([csvContent.map(c=>c.join(',')).join('\n')], { type: "application/txt" })
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
        
        <div style={{flexGrow:1, overflowY:'auto'}}>
            <Table>
                <thead>
                    <tr><td></td><td>Type</td><td>Address</td>
                    <td>Rent</td><td>Comp</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        curWorkerComp.map((cmp,key) => {
                            const lt = cmpToLease(cmp);
                            if (!lt.payments.length) return <></>;
                            return <><tr key={key}><td>{cmp.amount}</td><td>{cmp.type}</td><td>{cmp.address}</td>
                                <td>{lt.total}</td><td>{ getCmpAmt(cmp).toFixed(2)}</td>
                                <td><div style={{cursor:'pointer'}} onClick={()=>{
                                    setShowDetails(state=>{
                                        return {
                                            ...state,
                                            [cmp.houseID]: !state[cmp.houseID],
                                        }
                                    });

                                }}>{ lt.payments.length?'+':'' }</div></td>
                            </tr>
                            {
                                showDetails[cmp.houseID] && lt.payments.map(pmt=>{
                                    return <tr key={`detail-${key}`}><td>{moment(pmt.receivedDate).format('YYYY-MM-DD')}</td><td>{pmt.paidBy}</td><td>{pmt.notes}</td><td>{pmt.receivedAmount}</td></tr>
                                })
                            }
                            </>
                        })
                    }
                    {
                        <tr key={'endkey'}><td>Total</td><td></td><td></td>
                            <td>{
                                sumBy(curWorkerComp.map(cmpToLease),'total').toFixed(2)
                            }</td><td>
                                {
                                    totalEarned.toFixed(2)
                                }
                            </td></tr>
                    }
                </tbody>
            </Table>
            <Table>
                <thead>                
                </thead>
                <tbody>
                    {
                        maintenanceRecordsByExpCat.cats.map((mr,key) => {                            
                            return <><tr key={key}>
                                <td style={{textDecoration:mr.reimburse?'none':'line-through'}}>{mr.name}</td><td>{mr.total}</td>
                                <td></td><td></td>
                                <td><div style={{cursor:'pointer'}} onClick={()=>{
                                    setShowDetails(state=>{
                                        return {
                                            ...state,
                                            [mr.id]: !state[mr.id],
                                        }
                                    });

                                }}>+</div></td>
                                </tr>
                                {
                                    showDetails[mr.id] && mr.items.map(itm=><tr><td></td><td>{itm.amount}</td><td>{itm.address}</td><td>{moment(itm.date).format('YYYY-MM-DD')}</td><td>{itm.description}</td></tr>)
                                    
                                }
                                </>
                        })
                    }
                    {
                        <tr><td>Total</td>
                            <td>{
                                maintenanceRecordsByExpCat.total.toFixed(2)
                            }</td>
                            </tr>
                    }
                </tbody>
            </Table>
            <span>
                Total to be paied: {(totalEarned + maintenanceRecordsByExpCat.total).toFixed(2)}
            </span>
        </div>
    </div>
}