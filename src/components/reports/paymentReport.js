import React, {useState, useEffect} from 'react';
import moment from 'moment';
import { getPaymnents } from '../aapi';
import { Table } from 'react-bootstrap';
import EditDropdown from '../paymentMatch/EditDropdown';
import { TOTALCOLNAME } from './rootData';
import { MonthRange } from './monthRange';
export default function PaymentReport(props) {
    const jjctx = props.jjctx;
    const {
        paymentsByMonth,
        selectedMonths, 
    } = jjctx;

    const [selectedHouses, setSelectedHouses] = useState({});
    
    const monAddr = paymentsByMonth.originalData.reduce((acc, d) => {
        //console.log(d);
        if (!selectedMonths[d.month]) return acc;
        
        let addData = acc.houseByKey[d.addressId];
        if (!addData) {
            addData = {
                addressId: d.addressId,
                address: d.address,
                [TOTALCOLNAME]:0,
            };
            acc.houseByKey[d.addressId] = addData;
            acc.houseAry.push(addData);
        }

        let monData = addData[d.month];
        if (!monData) {
            monData = {
                amount: 0,
            };
            addData[d.month] = monData;
        }
        if (selectedHouses[d.addressId]) {
            monData[TOTALCOLNAME] += d.amount;
            acc.total += d.amount;
        }
        if (!acc.monthByKey[d.month]) {
            acc.monthByKey[d.month] = true;
            acc.monthAry.push(d.month);
        }
        monData.amount += d.amount;
        if (selectedHouses[d.addressId]) {
            addData[TOTALCOLNAME] += d.amount;
            acc.monthTotal[d.month] = (acc.monthTotal[d.month] || 0) + d.amount;
        }
        return acc;
    }, {
        monthAry: [],
        monthByKey: {},
        houseAry: [],
        houseByKey: {},
        monthTotal: {},
        total: 0,
    });

    monAddr.monthAry.sort();

    console.log(monAddr);
    const goodHouses = monAddr.houseAry.map(h => h.address);
    goodHouses.sort();
    useEffect(() => {
        const sh = monAddr.houseAry.reduce((acc, h) => {
            acc[h.addressId] = true;
            return acc;
        }, {});
        setSelectedHouses(sh);
    }, [goodHouses.join(',')]);

    //console.log(monAddr);
    return <>
        <MonthRange jjctx={jjctx} />
        <div>
            {
                monAddr.houseAry.map((h,key) => {
                    return <><input type='checkbox' key={key} checked={!!selectedHouses[h.addressId]} onChange={() => {
                        setSelectedHouses({ ...selectedHouses, [h.addressId]: !selectedHouses[h.addressId] });
                    }}></input>{h.address}<span></span></>
                })
            }
        </div>
        <Table>
        <thead>
            <tr>
                <td>Month</td><td>Total</td>
                {
                        monAddr.monthAry.map(m => {
                            return <td>{m}</td>
                        })
            }</tr>
        </thead>
        <tbody>
            {
                    monAddr.houseAry.map(house => {
                        if (!selectedHouses[house.addressId]) return null;
                        const curHouse = monAddr.houseByKey[house.addressId];
                        return <tr>
                            <td>{house.address}</td>
                            <td>{curHouse[TOTALCOLNAME]}</td>
                            {
                                monAddr.monthAry.map(mon => {
                                    return < td > {
                                        (curHouse[mon] || {}).amount

                                    }</td>
                                })
                            }
                        </tr>
                    })
            }
            {
                <tr>
                    <td>Total</td>
                    <td>{monAddr.total}</td>
                    {
                        monAddr.monthAry.map(m => {
                            return < td > {
                                monAddr.monthTotal[m]
                            }</td>
                        })
                    }
                </tr>
            }
        </tbody>
    </Table></>
}