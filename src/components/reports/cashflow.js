import React, {useState, useEffect} from 'react';
import EditDropdown from '../paymentMatch/EditDropdown';
import moment from 'moment';
import { TOTALCOLNAME } from './rootData';
import { MonthRange } from './monthRange';
export default function CashFlowReport(props) {
    const jjctx = props.jjctx;
    const { paymentsByMonth, expenseData, calculateExpenseByDate, calculateIncomeByDate, allMonthes,
        monthes, setMonthes,
        curMonthSelection, setCurMonthSelection,
        selectedMonths, setSelectedMonths
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
        <EditDropdown context={{
            disabled: false,
            curSelection:curMonthSelection, setCurSelection:setCurMonthSelection, getCurSelectionText: x=>x.label || '',
            options: ['LastMonth', 'Last3Month', 'Y2D', 'LastYear'].map(value => ({
                value,
                    label:value,
            })), setOptions: () => { },
            loadOptions: ()=>null,
        }}></EditDropdown>
        <div>
            {
                allMonthes.map(m => {
                    return <div><input type='checkbox' checked={selectedMonths[m]} onClick={() => {
                        selectedMonths[m] = !selectedMonths[m];
                        setSelectedMonths({ ...selectedMonths });
                    }}></input>{m}</div>
                })
            }
        </div>
        <table className='tableReport'>
            <thead>
            
                <th className='tdColumnHeader'></th><th className='tdColumnHeader'>Total</th>
                {
                    monthes.map(mon => {
                        return <th className='tdColumnHeader'>{ mon}</th>
                    })
                }
                
            </thead>
            <tbody><tr>
                <td className='tdLeftSubHeader' colSpan={monthes.length+2}>Income</td></tr>
                <tr><td>
                </td><td >{fMoneyformat(paymentsByMonth[TOTALCOLNAME].total)}</td>
                {
                    monthes.map(name => {
                        const mon = paymentsByMonth[name];
                        if (!mon) return <td></td>;
                        return <td>{ fMoneyformat(mon.total)}</td>
                    })
                }</tr>
                <tr><td className='tdLeftSubHeader' colSpan={monthes.length+2}>Expenses</td></tr>
            
                
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
                <tr>
                    <td colSpan={monthes.length+2}></td>
                </tr>
                <tr>
                    <td className='tdLeftSubHeader tdButtomTotalCell'>Net Income</td>
                    <td class='tdCenter tdTotalBold'>{ fMoneyformat((paymentsByMonth[TOTALCOLNAME].total -expenseData.categoriesByKey[TOTALCOLNAME][TOTALCOLNAME]))}</td>
                    {
                        monthes.map(mon => {
                            const inc = paymentsByMonth[mon] || {};
                            const incTotal = inc.total || 0;
                            const cost = expenseData.monthlyTotal[mon] || 0;
                            return <td className='tdButtomTotalCell tdTotalBold tdCenter t'>{fMoneyformat( (incTotal - cost))}</td>
                        })
                    }
                </tr>
            </tbody>
        </table>
    </>
}