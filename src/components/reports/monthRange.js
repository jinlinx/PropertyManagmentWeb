
import React, {useState, useEffect} from 'react';
import EditDropdown from '../paymentMatch/EditDropdown';

export function MonthRange(props) {
    const jjctx = props.jjctx;
    const {
        //paymentsByMonth, expenseData, calculateExpenseByDate, calculateIncomeByDate,
        allMonthes,
        //monthes, setMonthes,
        curMonthSelection, setCurMonthSelection,
        selectedMonths, setSelectedMonths
    } = jjctx;

    const [showDetails, setShowDetails] = useState(false);
    useEffect(() => {
        setCurMonthSelection({
            value: 'All',
            label:'All'
       }) 
    },[]);
    return <>
        <div>
        <EditDropdown context={{
            disabled: false,
            curSelection:curMonthSelection, setCurSelection:setCurMonthSelection, getCurSelectionText: x=>x.label || '',
            options: ['All','LastMonth', 'Last3Month', 'Y2D', 'LastYear'].map(value => ({
                value,
                    label:value,
            })), setOptions: () => { },
            loadOptions: ()=>null,
            }}></EditDropdown>

            <input type='checkbox' checked={showDetails} onChange={() => {
                setShowDetails(!showDetails);
            }}></input> Show Details
        </div>
        <div>
            {
                showDetails && allMonthes.map((m, key) => {
                    return <div key={key}><input type='checkbox' checked={!!selectedMonths[m]} onChange={() => {
                        selectedMonths[m] = !selectedMonths[m];
                        setSelectedMonths({ ...selectedMonths });
                    }}></input>{m}</div>
                })
            }
        </div>
    </>
}