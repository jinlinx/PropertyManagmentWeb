import React, { useState, useEffect } from "react";
import { getMinDatesForMaintenance, getWorkerInfo, getAllMaintenanceData, getExpenseCategories } from '../api';
import moment from 'moment';
import EditDropdown from '../paymentMatch/EditDropdown';
export function YearlyMaintenanceReport(props) {
    const { ownerInfo } = props;
    const [state, setState] = useState({
        curYearSelection: { label: 'NA', value: 'NA' },
        curYearOptions: [],
        expenseCategories:[],
        expenseCategoriesMapping: {},
        workerInfos:[],
        workerInfoMapping: {},
    });
    useEffect(() => {
        getMinDatesForMaintenance(ownerInfo.ownerID).then(res => {
            console.log(res);
            if (res.rows && res.rows.length) {
                const { minDate } = res.rows[0];
                const fromYYYY = moment(minDate).format('YYYY');
                const currentYYYY = moment().format('YYYY');
                const years = [];
                for (let i = parseInt(currentYYYY); i >= parseInt(fromYYYY); i--) {
                    years.push(i.toString());
                }
                const dspYear = ((years[1] || years[0]) || '').toString();
                console.log(years.map(y => ({ label: y, value: y })))
                setState(prev => ({
                    ...prev,
                    minDate,
                    fromYYYY,
                    curYearOptions: years.map(y => ({ label: y, value: y })),
                    curYearSelection: { label: dspYear, value: dspYear },
                }));
                getDataForYYYY(dspYear);
            }
        });

        getExpenseCategories().then(exp => {
            const expenseCategories = exp.rows.reduce((acc, r) => {
                acc[r.expenseCategoryID] = r.expenseCategoryName;
                return acc;
            }, {});
            console.log(expenseCategories);
            console.log(exp.rows);
            setState(prev=>({
                ...prev,
                expenseCategories: exp.rows,
                expenseCategoriesMapping: expenseCategories,
            }))
        });

        getWorkerInfo().then(wkrs => {
            const workerInfoMapping = wkrs.rows.reduce((acc, r) => {
                acc[r.workerID] = r;
                return acc;
            }, {});
            setState(prev=>({
                ...prev,
                workerInfos: wkrs.rows,
                workerInfoMapping,
            }))
        })
    }, [ownerInfo.owerID]);
    console.log(`spesense cat=`)
    console.log(state.expenseCategories);
    return <div><EditDropdown context={{
        disabled: false,
        curSelection: state.curYearSelection || {},
        setCurSelection: s => {
            setState({
                ...state,
                curYearSelection: s || {},
            })
        },
        getCurSelectionText: o => o.label || '',
        options: state.curYearOptions,
        setOptions: null,
        loadOptions: () => [],
    }}></EditDropdown>
        <div>
            {
                state.expenseCategories.map((exp,keyi) => {
                    return <div key={keyi}>{exp.expenseCategoryName}</div>
                })
            }
        </div>
    </div>
}

function getDataForYYYY(yyyy) {
    if (!yyyy) return;
    const m = moment(yyyy, 'YYYY');
    console.log(`data for ${yyyy} is `);
    console.log(m.toDate().toISOString());
    
}