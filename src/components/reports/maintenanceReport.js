import React, {useState, useEffect} from 'react';
import moment from 'moment';
import { getMaintenanceReport } from '../aapi';
import { Table } from 'react-bootstrap';
import EditDropdown from '../paymentMatch/EditDropdown';
export default function MaintenanceReport() {
    const getInitTableData = () => ({
        dateKeys: {},
        monthes: [],
        monthlyTotal: {},
        categorieKeys: {},
        categories: [],
    });

    const [origData, setOrigData] = useState([]);
    const [tableData, setTableData] = useState(getInitTableData());
    const [curSelection, setCurSelection] = useState({label: ''});
    const [options, setOptions] = useState([]);

    const formatData = (datas,curSelection) => datas.reduce((acc, r) => {
        const month = moment(r.month).add(2,'days').format('YY-MM');
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
            const catToDate = formatData(datas);
            setOptions(catToDate.monthes.map(label => ({
                label
            })))
        })
    }, []);
    
    useEffect(() => {
        const catToDate = formatData(origData, curSelection);
        setTableData(catToDate);
        
        console.log(catToDate);
    }, [origData, curSelection])
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
                        tableData.monthes.map(m => <td>{m}</td>)
                    }
                </tr>
            </thead>
            <tbody>
                {
                    tableData.categories.map(cat => {
                        return <tr>
                            <td>{cat}</td><td>{tableData.categorieKeys[cat]['total'].toFixed(2)}</td>
                            {
                                tableData.monthes.map(mon => {
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
                        tableData.monthes.map(mon => {
                            return <td>{ (tableData.monthlyTotal[mon] || 0).toFixed(2) }</td>
                        })
                    }
                </tr>
            </tbody>
        </Table>
    </>
}