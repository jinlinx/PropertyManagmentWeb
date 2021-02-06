import React, {useState, useEffect} from 'react';
import moment from 'moment';
import { getMaintenanceReport } from '../aapi';
import { Table } from 'react-bootstrap';

export default function MaintenanceReport() {
    const getInitTableData = ()=>( {
        dateKeys: {},
        monthes: [],
        categorieKeys: {},
        categories: [],
    })
    const [tableData, setTableData] = useState(getInitTableData());

    useEffect(() => {
        getMaintenanceReport().then(datas => {
            const catToDate = datas.reduce((acc, r) => {
                const month = moment(r.month).format('YY-MM');
                if (!acc.dateKeys[month]) {
                    acc.dateKeys[month] = true;
                    acc.monthes.push(month);
                }
                let cats = acc.categorieKeys[r.category];
                if (!cats) {
                    cats = {total: 0};
                    acc.categorieKeys[r.category] = cats;
                    acc.categories.push(r.category);
                }
                cats[month] = r.amount;
                cats['total'] += r.amount;
                return acc;
            }, getInitTableData());
            setTableData(catToDate);
            console.log(catToDate);
        })
    },[]);
    return <>
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
                            <td>{cat}</td><td>{tableData.categorieKeys[cat]['total']}</td>
                            {
                                tableData.monthes.map(mon => {
                                    return <td>{tableData.categorieKeys[cat][mon] || '' }</td>  
                                })
                            }
                        </tr>
                    })
                }
            </tbody>
        </Table>
    </>
}