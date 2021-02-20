import React, {useState, useEffect} from 'react';
import moment from 'moment';
import { getPaymnents } from '../aapi';
import { Table } from 'react-bootstrap';
import EditDropdown from '../paymentMatch/EditDropdown';

export default function PaymentReport() {
    const [payments, setPayments] = useState([]);
    useEffect(() => {
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

    const columns = ['date', 'month', 'amount', 'address', 'total', 'note']
    return <Table>
        <thead>
            <tr>{
                columns.map(c => <td>{ c}</td>)
            }</tr>
        </thead>
        <tbody>
            {
                payments.map(p => {
                    return <tr>
                        {
                            columns.map(c => <td>
                                {p[c]}
                            </td>)
                        }
                    </tr>
                })
            }
        </tbody>
    </Table>
}