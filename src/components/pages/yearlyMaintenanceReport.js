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
        showWorkers: {},
        showCategories: {},
    });
    useEffect(() => {
        if (!ownerInfo.ownerID) {
            return console.log(`no owner id yet, continue`);            
        }
        getMinDatesForMaintenance(ownerInfo.ownerID).then(res => {
            console.log('setting up maintenacedata info for yearly Maintenance')
            if (res.rows && res.rows.length) {
                const { minDate } = res.rows[0];
                const fromYYYY = moment(minDate).format('YYYY');
                const currentYYYY = moment().format('YYYY');
                const years = [];
                for (let i = parseInt(currentYYYY); i >= parseInt(fromYYYY); i--) {
                    years.push(i.toString());
                }
                const dspYear = ((years[1] || years[0]) || '').toString();                
                console.log(`setting dspYear ${dspYear} length of ypar op=${years.length}`)
                if (years.length === 0) {
                    console.log('year ret is ');
                    console.log(res)
                }
                setState(prev => ({
                    ...prev,
                    minDate,
                    fromYYYY,
                    dspYear,
                    ownerID: ownerInfo.ownerID,
                    curYearOptions: years.map(y => ({ label: y, value: y })),
                    curYearSelection: { label: dspYear, value: dspYear },
                }));                
            }
        });

        getExpenseCategories().then(exp => {
            console.log('setting up expenseCategory info for yearly Maintenance')
            const expenseCategories = exp.rows.reduce((acc, r) => {
                acc[r.expenseCategoryID] = r.expenseCategoryName;
                return acc;
            }, {});

            const showCategories = exp.rows.reduce((acc, r) => {
                acc[r.expenseCategoryID] = true;
                return acc;
            }, {});
                        
            setState(prev=>({
                ...prev,
                expenseCategories: exp.rows,
                expenseCategoriesMapping: expenseCategories,
                showCategories,
            }))
        });

        getWorkerInfo().then(wkrs => {
            console.log('setting up worker info for yearly Maintenance')
            const workerInfoMapping = wkrs.rows.reduce((acc, r) => {
                acc[r.workerID] = r;
                return acc;
            }, {});
            const showWorkers = wkrs.rows.reduce((acc, r) => {
                acc[r.workerID] = true;
                return acc;
            }, {});
            setState(prev=>({
                ...prev,
                workerInfos: wkrs.rows,
                workerInfoMapping,
                showWorkers,
            }))
        })
    }, [ownerInfo.ownerID]);
    
    
    useEffect(() => {
        console.log(`loading data for ${state.dspYear}`)
        getDataForYYYY(state, setState); 
    }, [state.dspYear]);
    return <div><EditDropdown context={{
        disabled: false,
        curSelection: state.curYearSelection || {},
        setCurSelection: s => {
            setState({
                ...state,
                dspYear: s?.value,
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
            {
                state.curYearOptions.map((d, keyi) => {
                    return <div key={keyi}>y={d.label}</div>
                })
            }
        </div>
    </div>
}

function getDataForYYYY(state, setState) {
    const { dspYear, ownerID } = state;
    if (!dspYear) return;
    const m = moment(dspYear, 'YYYY');
    console.log(`data for ${dspYear} is `);
    console.log(m.toDate().toISOString());
    const startDate = m.format('YYYY-MM-DD');
    const endDate = m.add(1, 'year').startOf('year').format('YYYY-MM-DD');
    console.log(`star= ${startDate} end=${endDate}`)
    getAllMaintenanceData(ownerID, startDate, endDate).then(rrr => {
        const dataRows = rrr.rows;
        console.log(dataRows)
    })
}