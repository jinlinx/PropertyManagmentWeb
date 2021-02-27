import React, {useState, useEffect} from 'react';
import { TOTALCOLNAME,fMoneyformat } from './rootData';
import { MonthRange } from './monthRange';

export default function MaintenanceReport(props) {
    const jjctx = props.jjctx;
    const {
        expenseData,
        monthes,
    } = jjctx;

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
                    [...expenseData.categoryNames].map((cat,key) => {
                        return <tr key={key}>
                            <td className='tdLeftSubCategoryHeader'>{cat}</td><td className='tdCenter  tdTotalItalic'>{fMoneyformat(expenseData.categoriesByKey[cat][TOTALCOLNAME])}</td>
                            {
                                monthes.map((mon,key) => {
                                    return <td className='tdCenter' key={key}>{fMoneyformat(expenseData.categoriesByKey[cat][mon] || '' )}</td>  
                                })
                            }
                        </tr>
                    })
                    }
                <tr><td className='tdLeftSubCategoryHeader'>Total</td><td className='tdCenter  tdTotalItalic'>{
                    fMoneyformat(expenseData.categoriesByKey[TOTALCOLNAME][TOTALCOLNAME])
                }</td>
                    {
                        monthes.map((mon,key) => {
                            return <td className='tdCenter tdTotalItalic' key={key}>{ fMoneyformat((expenseData.monthlyTotal[mon] || 0)) }</td>
                        })
                    }
                </tr>

            </tbody>
        </table>
    </>
}