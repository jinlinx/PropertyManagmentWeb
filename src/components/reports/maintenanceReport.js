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
                <th className='tdColumnHeader'>Expenses</th><th className='tdColumnHeader'>Total</th>
                {
                    monthes.map(mon => {
                        return <th className='tdColumnHeader'>{ mon}</th>
                    })
                }
            </thead>
            <tbody>
                {
                    //expenses
                    [...expenseData.categoryNames].map(cat => {
                        return <tr>
                            <td className='tdLeftSubCategoryHeader'>{cat}</td><td class='tdCenter  tdTotalItalic'>{fMoneyformat(expenseData.categoriesByKey[cat][TOTALCOLNAME])}</td>
                            {
                                monthes.map(mon => {
                                    return <td class='tdCenter'>{fMoneyformat(expenseData.categoriesByKey[cat][mon] || '' )}</td>  
                                })
                            }
                        </tr>
                    })
                    }
                <tr><td className='tdLeftSubCategoryHeader'>Total</td><td class='tdCenter  tdTotalItalic'>{
                    fMoneyformat(expenseData.categoriesByKey[TOTALCOLNAME][TOTALCOLNAME])
                }</td>
                    {
                        monthes.map(mon => {
                            return <td class='tdCenter tdTotalItalic'>{ fMoneyformat((expenseData.monthlyTotal[mon] || 0)) }</td>
                        })
                    }
                </tr>

            </tbody>
        </table>
    </>
}