import React, {useEffect, useState} from 'react';
import { Form, Row, Col, Table } from 'react-bootstrap';
import { getPaymnents } from '../aapi';
import moment from 'moment';

export default function CashFlow() {
    const [payments, setPayments] = useState([]);
    const [paymentsByMonth, setPaymentsByMonth] = useState([]);
    useEffect(() => {
        getPaymnents().then(p => setPayments(p));
    }, []);
    
    useEffect(() => {
        const pm = payments.reduce((acc, p) => {
            const month = moment(p.date).format('YYYY-MM');
            let m = acc.months[month];
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
            months: {},
            monthNames:[],
        });
        setPaymentsByMonth(pm.monthNames.map(n => {
            return pm.months[n];
        }))
    }, [payments]);
    const houses = ['All', '1633 Highland', '1637 Highland', '1543 something'];
    const [houseChecked, setHouseChecked] = useState(houses.map(x => false));
    return <>
        <Form>
            <Row>
                <Col><Form.Control type="date" name="startDate" placeholder="Start" /></Col>
                <Col><Form.Control type="date" name="endDate" placeholder="Start" /></Col>

            </Row>
        </Form>
        <Table>
            <thead>
                <tr>{
                    paymentsByMonth.map(mon => {
                        return <td>{ mon.month}</td>
                    })
                }
                </tr>
            </thead>
            <tbody><tr>
                {
                    paymentsByMonth.map(mon => {
                        return <td>{ mon.total.toFixed(2)}</td>
                    })
                }</tr>
            </tbody>
        </Table>
    </>;
}