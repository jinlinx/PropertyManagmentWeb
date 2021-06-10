import React, {useState} from 'react';
import { TOTALCOLNAME,fMoneyformat } from './rootData';
import { MonthRange } from './monthRange';
import { getPaymentsByMonthAddress, getMaintenanceData } from './reportUtil';
import { Modal, Container, } from 'react-bootstrap';
import moment from 'moment';
export default function CashFlowReport(props) {
    const jjctx = props.jjctx;
    const {
        payments,
        rawExpenseData,
        selectedHouses,
        monthes, 
        paymentCalcOpts,
    } = jjctx;
    
    const monAddr = getPaymentsByMonthAddress(payments, paymentCalcOpts);

    const calculatedMaintData = getMaintenanceData(rawExpenseData, paymentCalcOpts);
    const [showDetail, setShowDetail] = useState(null);
    const [showExpenseDetail, setShowExpenseDetail] = useState(null);
    return <>
        <Modal show={!!showDetail} onHide={() => {
                    setShowDetail(null);
                }}>
                    <Modal.Header closeButton>
                <Modal.Body>{(showDetail||[]).map(d => {
                    return <div>{d.amount.toFixed(2)} {d.date} {d.address} {d.notes} { d.debugText}</div>
                })}</Modal.Body>
                    </Modal.Header>
                    <Container>
                    </Container>
        </Modal>
        
        <Modal show={!!showExpenseDetail} onHide={() => {
            setShowExpenseDetail(null);
        }}>
            <Modal.Header closeButton>
                <Modal.Body>{(showExpenseDetail || []).map(d => {
                    return <div>{d.debugText}</div>
                })}</Modal.Body>
            </Modal.Header>
            <Container>
            </Container>
        </Modal>
        <MonthRange jjctx={jjctx}></MonthRange>
        <table className='tableReport'>
            <thead>
            
                <td className='tdColumnHeader'></td><td className='tdColumnHeader'>Total</td>
                {
                    monthes.map((mon,key) => {
                        return <th className='tdColumnHeader' key={key}>{ mon}</th>
                    })
                }
                
            </thead>
            <tbody><tr>
                <td className='tdLeftSubHeader' colSpan={monthes.length + 2}>Income</td></tr>
                {
                    monAddr.houseAry.filter(h=>(selectedHouses[h.addressId] )).map((house,key) => {
                        const curHouse = monAddr.houseByKey[house.addressId];
                        return <tr key={key}>
                            <td className='tdLeftSubCategoryHeader'>{house.address}</td>
                            <td className='tdCenter  tdTotalItalic'>{fMoneyformat(house.total)}</td>
                            {
                                monthes.map((mon, key) => {
                                    const curHouseMon = (house.monthes[mon] || {});
                                    return < td key={key} className='tdCenter' onClick={() => setShowDetail(curHouseMon.records)}> {
                                        fMoneyformat(curHouseMon.amount)

                                    }</td>
                                })
                            }
                        </tr>
                    })
                }
                <tr><td>Non Rent</td></tr>
                {
                    monAddr.nonRentAry.map((nonRent, key) => {                        
                        return <tr key={key}>
                            <td className='tdLeftSubCategoryHeader'>{nonRent.displayName}</td>
                            <td className='tdCenter  tdTotalItalic' onClick={() => setShowDetail(nonRent.records)}>{fMoneyformat(nonRent.total)}</td>
                            {
                                monthes.map((mon, key) => {
                                    const curMon = (nonRent.monthes[mon] || {});
                                    return < td key={key} className='tdCenter' onClick={() => setShowDetail(curMon.records)}> {
                                        fMoneyformat(curMon.amount)

                                    }</td>
                                })
                            }
                        </tr>
                    })
                }
                <tr>

                <td className='tdLeftSubCategoryHeader'>Sub Total:
                </td><td className='tdCenter  tdTotalItalic'>{fMoneyformat(monAddr.total)}</td>
                {
                    monthes.map((name,key) => {
                        //const monDbg = paymentsByMonth[name];
                        const mon = monAddr.monthTotal[name];
                        // dbg={ monDbg?.total}
                        if (!mon && mon !== 0) return <td className='tdCenter  tdTotalItalic' key={key}></td>;
                        return <td className='tdCenter  tdTotalItalic' key={key}>{fMoneyformat(mon)}</td>
                    })
                    }</tr>
                
                <tr><td className='tdLeftSubHeader' colSpan={monthes.length+2}>Expenses</td></tr>
            
                
                {
                    [...calculatedMaintData.categoryNames].map((cat, key) => {
                        return <tr key={key}>
                            <td className='tdLeftSubCategoryHeader'>{cat}</td><td class='tdCenter  tdTotalItalic'>{fMoneyformat(calculatedMaintData.categoryTotals[cat])}</td>
                            {
                                monthes.map((mon, key) => {
                                    const catMon = calculatedMaintData.getCatMonth(cat, mon);
                                    return <td key={key} class='tdCenter' onClick={() => {
                                        if (catMon.amountCalcParts) {
                                            console.log('catMon')
                                            console.log(catMon)
                                            const msgs = catMon.amountCalcParts.reduce((acc, r) => {
                                                console.log(r)
                                                if (r.calcInfo) {
                                                    r.calcInfo.forEach(i => acc.push({
                                                        debugText: i.info
                                                    }));
                                                }
                                                return acc;
                                            }, [
                                                {
                                                debugText: `For Total expense of ${catMon.amount.toFixed(2)}`
                                                },
                                                ...catMon.records.reduce((acc,r) => {
                                                    acc.push({
                                                        debugText: `=> ${r.amount} is from`
                                                    });
                                                    r.records.forEach(r => {
                                                        acc.push({
                                                            debugText: `===> ${moment(r.date).format('YYYY-MM-DD')} ${r.amount} ${r.comment} ${r.description}`
                                                        });
                                                    })
                                                    return acc;
                                                }, []),
                                                {
                                                    debugText:'====== breakdowns '
                                                }
                                            ]);
                                            setShowExpenseDetail(msgs)
                                        }
                                    }}>{fMoneyformat(catMon.amount)}</td>
                                })
                            }
                        </tr>
                    })
                }
                <tr><td className='tdLeftSubCategoryHeader'>Sub Total</td><td class='tdCenter  tdTotalItalic'>{
                    fMoneyformat(calculatedMaintData.total)
                }</td>
                    {
                        monthes.map((mon,key) => {
                            return <td key={key} class='tdCenter tdTotalItalic'>{fMoneyformat((calculatedMaintData.monthlyTotal[mon] || 0)) }</td>
                        })
                    }
                </tr>
                <tr>
                    <td colSpan={monthes.length+2}></td>
                </tr>
                <tr>
                    <td className='tdLeftSubHeader tdButtomTotalCell'>Net Income</td>
                    <td class='tdCenter tdTotalBold'>{fMoneyformat((monAddr.total - calculatedMaintData.total))}</td>
                    {
                        monthes.map((mon,key) => {
                            const incTotal = monAddr.monthTotal[mon] || 0; //paymentsByMonth[mon] || {};
                            //const incTotal = inc.total || 0;
                            const cost = calculatedMaintData.monthlyTotal[mon] || 0;
                            return <td key={key} className='tdButtomTotalCell tdTotalBold tdCenter t'>{fMoneyformat( (incTotal - cost))}</td>
                        })
                    }
                </tr>
            </tbody>
        </table>
    </>
}