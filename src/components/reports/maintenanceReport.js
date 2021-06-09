import React from 'react';
import { fMoneyformat } from './rootData';
import { MonthRange } from './monthRange';
import { getMaintenanceData } from './reportUtil';

export default function MaintenanceReport(props) {
    const jjctx = props.jjctx;
    const {
        monthes,
        paymentCalcOpts,
        rawExpenseData,
    } = jjctx;

    const calculatedMaintData = getMaintenanceData(rawExpenseData, paymentCalcOpts);
    return <>
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
                    [...calculatedMaintData.categoryNames].map((cat,key) => {
                        return <tr key={key}>
                            <td className='tdLeftSubCategoryHeader'>{cat}</td><td className='tdCenter  tdTotalItalic'>{fMoneyformat(calculatedMaintData.categoryTotals[cat])}</td>
                            {
                                monthes.map((mon,key) => {
                                    return <td className='tdCenter' key={key}>{fMoneyformat(calculatedMaintData.categoriesByKey[cat][mon] || '' )}</td>
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