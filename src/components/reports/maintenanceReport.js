import React, {useState, useEffect} from 'react';
import moment from 'moment';
import { getMaintenanceReport, getPaymnents } from '../aapi';
import { Table } from 'react-bootstrap';
import EditDropdown from '../paymentMatch/EditDropdown';
import { sumBy, uniq } from 'lodash';
export default function MaintenanceReport() {
    const getInitTableData = () => ({
        dateKeys: {},
        monthes: [],
        monthlyTotal: {},
        categorieKeys: {},
        categories: [],
    });

    const [origData, setOrigData] = useState([]);
    const [payments, setPayments] = useState([]);
    const [paymentsByMonth, setPaymentsByMonth] = useState({
        total:0
    });

    const [allMonthes, setAllMonthes] = useState([]);
    const [monthes, setMonthes] = useState([]);

    const [tableData, setTableData] = useState(getInitTableData());
    const [curSelection, setCurSelection] = useState({label: ''});
    const [options, setOptions] = useState([]);

    const formatData = (datas,curSelection) => datas.reduce((acc, r) => {
        const month = moment(r.month).add(2,'days').format('YYYY-MM');
        if (curSelection && month < curSelection.label) return acc;
        if (!acc.dateKeys[month]) {
            acc.dateKeys[month] = true;
            acc.monthes.push(month);
        }
        let cats = acc.categorieKeys[r.category];
        if (!cats) {
            cats = { total: 0 };
            acc.categorieKeys[r.category] = cats;
            acc.categories.push(r.category);
        }
        cats[month] = r.amount;
        cats['total'] += r.amount;
        acc.monthlyTotal[month] = (acc.monthlyTotal[month] || 0) + r.amount;
        return acc;
    }, getInitTableData());
    useEffect(() => {
        getMaintenanceReport().then(datas => {
            setOrigData(datas);
            
        })

        getPaymnents().then(r => {
            r = r.map(r => {
                return {
                    ...r,
                    date: moment(r.date).format('YYYY-MM-DD'),
                    month: moment(r.date).format('YYYY-MM'),
                }
            }).sort((a, b) => {
                if (a.date > b.date) return 1;
                if (a.date < b.date) return -1;
                return 0;
            });
            r = r.reduce((acc, r) => {
                if (acc.curMon !== r.month) {
                    acc.curMon = r.month;
                    acc.total = 0;
                }
                acc.total += r.amount;
                r.total = acc.total;
                acc.res.push(r);
                return acc;
            }, {
                    res: [],
                    curMon: null,
                total: 0,
            });
            setPayments(r.res);
        })
    }, []);
    
    //set month selection
    useEffect(() => {
        const catToDate = formatData(origData);
        const monthes = uniq(payments.reduce((acc, p) => {
            if (!acc.founds[p.month]) {
                acc.founds[p.month] = true;
                acc.monthes.push(p.month);
            }
            return acc; 
        }, {
            founds: {},
            monthes: [],
        }).monthes.concat(catToDate.monthes)).sort();
        setAllMonthes(monthes);
        setMonthes(monthes);
        setOptions(monthes.map(label => ({
            label
        })));
    }, [origData, payments])

    //format data
    useEffect(() => {
        const catToDate = formatData(origData, curSelection);
        setTableData(catToDate);
        setMonthes(allMonthes.filter(m => !curSelection || m >= curSelection.label));
        
        const pm = payments.reduce((acc, p) => {
            const month = moment(p.date).format('YYYY-MM');
            if (curSelection && month < curSelection.label) return acc;
            let m = acc.months[month];
            acc.months.total += p.amount;
            if (!m) {
                m = {
                    month,
                    total: 0,
                };
                acc.months[month] = m;
                acc.monthNames.push(month);
            }
            m.total += parseFloat(p.amount);
            return acc;
        }, {
            months: {
                total: 0,
            },
            monthNames: [],
        });
        setPaymentsByMonth(pm.months)
    }, [origData, payments, curSelection]);

    return <>
        <EditDropdown context={{
            disabled: false,
            curSelection, setCurSelection, getCurSelectionText: x=>x.label || '',
            options, setOptions,
            loadOptions: ()=>null,
        }}></EditDropdown>
        <Table>
            <thead>
            <tr>
                <td>Categories</td><td>total</td>
                {
                    monthes.map(mon => {
                        return <td>{ mon}</td>
                    })
                }
                </tr>
            </thead>
            <tbody><tr>
                <td>Income</td><td>{ paymentsByMonth.total.toFixed(2) }</td>
                {
                    monthes.map(name => {
                        const mon = paymentsByMonth[name];
                        if (!mon) return <td></td>;
                        return <td>{ mon.total.toFixed(2)}</td>
                    })
                }</tr>
                <tr><td>Expenses</td></tr>
                {
                    tableData.categories.map(cat => {
                        return <tr>
                            <td>{cat}</td><td>{tableData.categorieKeys[cat]['total'].toFixed(2)}</td>
                            {
                                monthes.map(mon => {
                                    return <td>{tableData.categorieKeys[cat][mon] || '' }</td>  
                                })
                            }
                        </tr>
                    })
                }
                <tr><td>Total:</td><td>{
                    tableData.categories.reduce((acc, c) => {
                        return acc + (tableData.categorieKeys[c]['total'] || 0);
                    },0).toFixed(2)
                }</td>
                    {
                        monthes.map(mon => {
                            return <td>{ (tableData.monthlyTotal[mon] || 0).toFixed(2) }</td>
                        })
                    }
                </tr>
                <tr>
                    <td>Net Income:</td>
                    <td>{ (paymentsByMonth.total -tableData.categories.reduce((acc, c) => {
                        return acc + (tableData.categorieKeys[c]['total'] || 0);
                    },0)).toFixed(2)}</td>
                    {
                        monthes.map(mon => {
                            const inc = paymentsByMonth[mon];
                            const incTotal = inc.total || 0;
                            const cost = tableData.monthlyTotal[mon] || 0;
                            return <td>{ (incTotal - cost).toFixed(2)}</td>
                        })
                    }
                </tr>
            </tbody>
        </Table>
    </>
}