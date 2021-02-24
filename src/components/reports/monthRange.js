
import React, {useState, useEffect} from 'react';
import EditDropdown from '../paymentMatch/EditDropdown';

export function MonthRange(props) {
    const jjctx = props.jjctx;
    const { paymentsByMonth, expenseData, calculateExpenseByDate, calculateIncomeByDate, allMonthes,
        monthes, setMonthes,
        curMonthSelection, setCurMonthSelection,
        selectedMonths, setSelectedMonths
    } = jjctx;

    useEffect(() => {
        setCurMonthSelection({
            value: 'All',
            label:'All'
       }) 
    },[]);
    return <>
        <EditDropdown context={{
            disabled: false,
            curSelection:curMonthSelection, setCurSelection:setCurMonthSelection, getCurSelectionText: x=>x.label || '',
            options: ['All','LastMonth', 'Last3Month', 'Y2D', 'LastYear'].map(value => ({
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
    </>
}