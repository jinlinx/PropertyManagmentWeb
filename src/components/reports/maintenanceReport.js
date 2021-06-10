import React, {useState} from 'react';
import { fMoneyformat } from './rootData';
import { MonthRange } from './monthRange';
import { getMaintenanceData } from './reportUtil';
import { Modal, Container, } from 'react-bootstrap';
export default function MaintenanceReport(props) {
    const jjctx = props.jjctx;
    const {
        monthes,
        paymentCalcOpts,
        rawExpenseData,
    } = jjctx;

    const calculatedMaintData = getMaintenanceData(rawExpenseData, paymentCalcOpts);
    const [showExpenseDetail, setShowExpenseDetail] = useState(null);
    return <>
        <Modal show={!!showExpenseDetail} onHide={() => {
            setShowExpenseDetail(null);
        }}>
            <Modal.Header closeButton>
                <Modal.Title>{(showExpenseDetail || []).map(d => {
                    return <div>{d.debugText}</div>
                })}</Modal.Title>
            </Modal.Header>
            <Container>
            </Container>
        </Modal>
        <MonthRange jjctx={jjctx}></MonthRange>
        <table className='tableReport'>
            <thead>
                <tr>
                <td className='tdColumnHeader'>Expenses</td><td className='tdColumnHeader'>Total</td>
                {
                    monthes.map((mon,key) => {
                        return <td className='tdColumnHeader' key={key}>{ mon}</td>
                    })
                    }
                </tr>
            </thead>
            <tbody>
                {
                    //expenses
                    [...calculatedMaintData.categoryNames].map((cat, key) => {
                        return <tr key={key}>
                            <td className='tdLeftSubCategoryHeader'>{cat}</td><td class='tdCenter  tdTotalItalic'>{fMoneyformat(calculatedMaintData.categoryTotals[cat])}</td>
                            {
                                monthes.map((mon, key) => {
                                    const catMon = calculatedMaintData.getCatMonth(cat, mon);
                                    return <td key={key} class='tdCenter' onClick={() => {
                                        if (catMon.amountCalcParts) {
                                            const msgs = catMon.amountCalcParts.reduce((acc, r) => {
                                                console.log(r)
                                                console.log(r.calcInfo)
                                                if (r.calcInfo) {
                                                    r.calcInfo.forEach(i => acc.push({
                                                        debugText: i.info
                                                    }));
                                                }
                                                return acc;
                                            }, [{
                                                debugText: `For Total expense of ${catMon.amount}`
                                            }]);
                                            setShowExpenseDetail(msgs)
                                        }
                                    }}>{fMoneyformat(catMon.amount)}</td>
                                })
                            }
                        </tr>
                    })
                    }
                <tr><td className='tdLeftSubCategoryHeader'>Total</td><td className='tdCenter  tdTotalItalic'>{
                    fMoneyformat(calculatedMaintData.total)
                }</td>
                    {
                        monthes.map((mon,key) => {
                            return <td className='tdCenter tdTotalItalic' key={key}>{fMoneyformat((calculatedMaintData.monthlyTotal[mon] || 0)) }</td>
                        })
                    }
                </tr>

            </tbody>
        </table>
    </>
}