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
        
        let monData = acc.monthByKey[d.month];
        if (!monData) {
            monData = {
                [TOTALCOLNAME]:0
            };
            acc.monthByKey[d.month] = monData;
            acc.monthAry.push(d.month);
        }
        if (!acc.houseKeys[d.addressId]) {
            const addr = {
                addressId: d.addressId,
                address: d.address,
            };
            acc.houseKeys[d.addressId] = addr;
            acc.houseNameAry.push(addr);
        }
        let addData = monData[d.addressId];
        if (!addData) {
            addData = {
                [TOTALCOLNAME]: 0,
                originalData: [],
                amount: 0,
            };
            monData[d.addressId] = addData;
        }
        if (selectedHouses[d.addressId]) {
            monData[TOTALCOLNAME] += d.amount;
            acc.total += d.amount;
        }
        addData.originalData.push(d);
        addData.amount += d.amount;
        addData[TOTALCOLNAME] += d.amount;
        acc.houseTotal[d.addressId] = (acc.houseTotal[d.addressId] || 0) + d.amount;
        return acc;
    }, {
        monthAry: [],
        monthByKey: {},
        houseNameAry: [],
        houseKeys: {},
        houseTotal: {},
        total: 0,
    });

    monAddr.monthAry.sort();

    const goodHouses = monAddr.houseNameAry.map(h => h.address);
    goodHouses.sort();
    useEffect(() => {
        const sh = monAddr.houseNameAry.reduce((acc, h) => {
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
                monAddr.houseNameAry.map((h,key) => {
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
                        monAddr.houseNameAry.map(h => {
                            if (selectedHouses[h.addressId])
                            return <td>{h.address}</td>
                        })
            }</tr>
        </thead>
        <tbody>
            {
                monAddr.monthAry.map(monName => {
                    const curMon = monAddr.monthByKey[monName];
                    return <tr>
                        <td>{monName}</td>
                        <td>{ curMon[TOTALCOLNAME]}</td>
                        {
                            monAddr.houseNameAry.map(h => {
                                if (selectedHouses[h.addressId])
                                return < td > {
                                    (curMon[h.addressId] || {}).amount

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
                        monAddr.houseNameAry.map(h => {
                            return < td > {
                                monAddr.houseTotal[h.addressId]
                            }</td>
                        })
                    }
                </tr>
            }
        </tbody>
    </Table></>
}