import React, {useState, useEffect} from 'react';
import { TOTALCOLNAME } from './rootData';
import { MonthRange } from './monthRange';

export default function MaintenanceReport(props) {
    const jjctx = props.jjctx;
    const {
        expenseData,
        monthes,
    } = jjctx;

    const fMoneyformat = amt=> {
        if (!amt) return '-';
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          
            // These options are needed to round to whole numbers if that's what you want.
            //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
            //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
        });
        return formatter.format(amt);
    };
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
                            <td className='tdLeftSubCategoryHeader'>{cat}</td><td class='tdCenter  tdTotalItalic'>{fMoneyformat(expenseData.categoriesByKey[cat][TOTALCOLNAME])}</td>
                            {
                                monthes.map((mon,key) => {
                                    return <td class='tdCenter' key={key}>{fMoneyformat(expenseData.categoriesByKey[cat][mon] || '' )}</td>  
                                })
                            }
                        </tr>
                    })
                    }
                <tr><td className='tdLeftSubCategoryHeader'>Total</td><td class='tdCenter  tdTotalItalic'>{
                    fMoneyformat(expenseData.categoriesByKey[TOTALCOLNAME][TOTALCOLNAME])
                }</td>
                    {
                        monthes.map((mon,key) => {
                            return <td class='tdCenter tdTotalItalic' key={key}>{ fMoneyformat((expenseData.monthlyTotal[mon] || 0)) }</td>
                        })
                    }
                </tr>

            </tbody>
        </table>
    </>
}