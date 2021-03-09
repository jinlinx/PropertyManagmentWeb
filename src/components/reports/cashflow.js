import React, {useState, useEffect} from 'react';
import { TOTALCOLNAME,fMoneyformat } from './rootData';
import { MonthRange } from './monthRange';
import { getPaymentsByMonthAddress } from './reportUtil';
export default function CashFlowReport(props) {
    const jjctx = props.jjctx;
    const {
        paymentsByMonth, expenseData,
        selectedMonths,
        monthes, 
    } = jjctx;

    const monAddr = getPaymentsByMonthAddress(paymentsByMonth.originalData, {
        isGoodMonth: m => selectedMonths[m],
        isGoodHouseId: ()=>true,
    });
    return <>
        <MonthRange jjctx={jjctx}></MonthRange>
        <table className='tableReport'>
            <thead>
            
                <th className='tdColumnHeader'></th><th className='tdColumnHeader'>Total</th>
                {
                    monthes.map((mon,key) => {
                        return <th className='tdColumnHeader' key={key}>{ mon}</th>
                    })
                }
                
            </thead>
            <tbody><tr>
                <td className='tdLeftSubHeader' colSpan={monthes.length + 2}>Income</td></tr>
                {
                    monAddr.houseAry.map((house,key) => {
                        const curHouse = monAddr.houseByKey[house.addressId];
                        return <tr key={key}>
                            <td className='tdLeftSubCategoryHeader'>{house.address}</td>
                            <td className='tdCenter  tdTotalItalic'>{fMoneyformat(curHouse[TOTALCOLNAME])}</td>
                            {
                                monthes.map((mon,key) => {
                                    return < td key={key} className='tdCenter  tdTotalItalic'> {
                                        fMoneyformat((curHouse[mon] || {}).amount)

                                    }</td>
                                })
                            }
                        </tr>
                    })
            }
                <tr><td>
                </td><td >{fMoneyformat(paymentsByMonth[TOTALCOLNAME].total)}</td>
                {
                    monthes.map((name,key) => {
                        const mon = paymentsByMonth[name];
                        if (!mon) return <td key={key}></td>;
                        return <td key={key}>{ fMoneyformat(mon.total)}</td>
                    })
                    }</tr>
                
                <tr><td className='tdLeftSubHeader' colSpan={monthes.length+2}>Expenses</td></tr>
            
                
                {
                    //expenses
                    [...expenseData.categoryNames].map((cat,key) => {
                        return <tr>
                            <td className='tdLeftSubCategoryHeader'>{cat}</td><td class='tdCenter  tdTotalItalic'>{fMoneyformat(expenseData.categoriesByKey[cat][TOTALCOLNAME])}</td>
                            {
                                monthes.map(mon => {
                                    return <td key={key} class='tdCenter'>{fMoneyformat(expenseData.categoriesByKey[cat][mon] || '' )}</td>  
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
                            return <td key={key} class='tdCenter tdTotalItalic'>{ fMoneyformat((expenseData.monthlyTotal[mon] || 0)) }</td>
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
                        monthes.map((mon,key) => {
                            const inc = paymentsByMonth[mon] || {};
                            const incTotal = inc.total || 0;
                            const cost = expenseData.monthlyTotal[mon] || 0;
                            return <td key={key} className='tdButtomTotalCell tdTotalBold tdCenter t'>{fMoneyformat( (incTotal - cost))}</td>
                        })
                    }
                </tr>
            </tbody>
        </table>
    </>
}