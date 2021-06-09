import React from 'react';
import { TOTALCOLNAME,fMoneyformat } from './rootData';
import { MonthRange } from './monthRange';
import { getPaymentsByMonthAddress, getMaintenanceData } from './reportUtil';
export default function CashFlowReport(props) {
    const jjctx = props.jjctx;
    const {
        paymentsByMonth,
        rawExpenseData,
        selectedHouses,
        monthes, 
        paymentCalcOpts,
    } = jjctx;
    
    const monAddr = getPaymentsByMonthAddress(paymentsByMonth.originalData, paymentCalcOpts);

    const calculatedMaintData = getMaintenanceData(rawExpenseData, paymentCalcOpts);
    return <>
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
                            <td className='tdCenter  tdTotalItalic'>{fMoneyformat(curHouse[TOTALCOLNAME])}</td>
                            {
                                monthes.map((mon,key) => {
                                    return < td key={key} className='tdCenter'> {
                                        fMoneyformat((curHouse[mon] || {}).amount)

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
                            <td className='tdCenter  tdTotalItalic'>{fMoneyformat(nonRent[TOTALCOLNAME])}</td>
                            {
                                monthes.map((mon, key) => {
                                    return < td key={key} className='tdCenter'> {
                                        fMoneyformat((nonRent[mon] || {}).amount)

                                    }</td>
                                })
                            }
                        </tr>
                    })
                }
                <tr>

                <td className='tdLeftSubCategoryHeader'>Sub Total:
                </td><td className='tdCenter  tdTotalItalic'>{fMoneyformat(paymentsByMonth[TOTALCOLNAME].total)}</td>
                {
                    monthes.map((name,key) => {
                        const monDbg = paymentsByMonth[name];
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
                                    return <td key={key} class='tdCenter'>{fMoneyformat(calculatedMaintData.categoriesByKey[cat][mon] || '')}</td>
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
                    <td class='tdCenter tdTotalBold'>{fMoneyformat((paymentsByMonth[TOTALCOLNAME].total - calculatedMaintData.total))}</td>
                    {
                        monthes.map((mon,key) => {
                            const inc = paymentsByMonth[mon] || {};
                            const incTotal = inc.total || 0;
                            const cost = calculatedMaintData.monthlyTotal[mon] || 0;
                            return <td key={key} className='tdButtomTotalCell tdTotalBold tdCenter t'>{fMoneyformat( (incTotal - cost))}</td>
                        })
                    }
                </tr>
            </tbody>
        </table>
    </>
}