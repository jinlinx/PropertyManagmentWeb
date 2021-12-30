import React, {useState, useEffect} from 'react';
import { TOTALCOLNAME,fMoneyformat } from './rootData';
import { MonthRange } from './monthRange';


import { getPaymentsByMonthAddress } from './reportUtil';

export default function PaymentReport(props) {
    const jjctx = props.jjctx;
    const {
        payments,
        selectedMonths, 
        beginReLoadPaymentData,
        houseAnchorInfo,
        ownerInfo,
        selectedHouses, setSelectedHouses,
    } = jjctx;

    //const [selectedHouses, setSelectedHouses] = useState({});
    
    const monAddr = getPaymentsByMonthAddress(payments, {
        isGoodMonth: m => selectedMonths[m],
        isGoodHouseId: id => selectedHouses[id],
        getHouseShareInfo: () => [...houseAnchorInfo ],
    });
    const goodHouses = monAddr.houseAry.map(h => h.address);
    goodHouses.sort();
    useEffect(()=>{
        beginReLoadPaymentData(ownerInfo);
    },[]);
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
                    }}></input>{h.address}<span key={`spn${key}`}></span></>
                })
            }
        </div>
        <table  className='tableReport'>
        <thead>
            <tr>
                <td className='tdColumnHeader'>Address</td><td className='tdColumnHeader'>Total</td>
                {
                        monAddr.monthAry.map((m,key) => {
                            return <td  className='tdColumnHeader' key={key}>{m}</td>
                        })
            }</tr>
        </thead>
        <tbody>
            {
                    monAddr.houseAry.map((house,key) => {
                        if (!selectedHouses[house.addressId]) return null;
                        const curHouse = monAddr.houseByKey[house.addressId];
                        return <tr key={key}>
                            <td className='tdLeftSubCategoryHeader'>{house.address}</td>
                            <td className='tdCenter  tdTotalItalic'>{fMoneyformat(curHouse.total)}</td>
                            {
                                monAddr.monthAry.map((mon,key) => {
                                    return < td key={key} className='tdCenter  tdTotalItalic'> {
                                        fMoneyformat((curHouse.monthes[mon] || {}).amount)

                                    }</td>
                                })
                            }
                        </tr>
                    })
            }
            {
                <tr>
                    <td className='tdLeftSubCategoryHeader'>Total</td>
                    <td className='tdCenter  tdTotalItalic'>{fMoneyformat(monAddr.total)}</td>
                    {
                        monAddr.monthAry.map((m,key) => {
                            return < td key={key} className='tdCenter  tdTotalItalic'> {
                                fMoneyformat(monAddr.monthTotal[m])
                            }</td>
                        })
                    }
                </tr>
            }
        </tbody>
    </table></>
}