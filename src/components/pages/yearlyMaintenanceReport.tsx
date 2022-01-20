import React, { useState, useEffect } from "react";
import { getMinDatesForMaintenance, getWorkerInfo, getAllMaintenanceData, getExpenseCategories } from '../api';
import moment from 'moment';
import EditDropdown, {IOptions} from '../paymentMatch/EditDropdown';
import { sortBy } from "lodash";
import {
    IIncomeExpensesContextValue, IWorkerInfo,
    IMaintenanceRawData,
} from '../reports/reportTypes';


interface IWithTotal {
    total: number;
}
interface IHashWithTotal {
    [catOrWkr: string]: IWithTotal;
}

interface IByWorkerByCat {
    byWorker: {
        [wkr: string]: {
            [cat: string]: {
                amount: number;
            };
        };
    };
    byWorkerTotal: IHashWithTotal;
    byCats: IHashWithTotal;
    total: number;
    workerIds: string[];
    workerIdHashFind: { [id: string]: boolean };
    catIds: string[];
    catIdHashFind: { [id: string]: boolean };
}

interface IYearlyMaintenanceReportState {
    curYearSelection: IOptions;
    curYearOptions: IOptions[];
    expenseCategories: { id: string, name: string; }[];
    expenseCategoriesMapping: { [id: string]: string };
    workerInfos: IWorkerInfo[];
    workerInfoMapping: { [id: string]: IWorkerInfo };
    showWorkers: { [id: string]: boolean };
    showCategories: {[cat:string]:boolean};
    rawData: IMaintenanceRawData[];
    dspYear: string,
    byWorkerByCat: IByWorkerByCat;
    ownerID: string;
}

export function YearlyMaintenanceReport(props: { jjctx: IIncomeExpensesContextValue }) {
    const { ownerInfo } = props.jjctx;
    const [state, setState] = useState<IYearlyMaintenanceReportState>({
        curYearSelection: { label: 'NA', value: 'NA' } as IOptions,
        curYearOptions: [],
        expenseCategories: [],
        expenseCategoriesMapping: {},
        workerInfos: [],
        workerInfoMapping: {},
        showWorkers: {},
        showCategories: {},
        rawData: [],
        dspYear: '',
        byWorkerByCat: {} as IByWorkerByCat,
        ownerID: '',
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
                const years = [] as string[];
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
            const expenseCategories = exp.rows.map(r => {
                return {
                    id: r.expenseCategoryID,
                    name: r.expenseCategoryName,
                };
            }).filter(r=>r.name);
            const expenseCategoriesMapping = expenseCategories.reduce((acc, r) => {
                acc[r.id] = r.name;
                return acc;
            }, {} as {[id:string]:string});

            const showCategories = exp.rows.reduce((acc, r) => {
                acc[r.expenseCategoryID] = true;
                return acc;
            }, {} as {[id:string]:boolean});
                        
            setState(prev=>({
                ...prev,
                expenseCategories,
                expenseCategoriesMapping,
                showCategories,
            }))
        });

        getWorkerInfo().then(wkrs => {
            console.log('setting up worker info for yearly Maintenance')
            const workerInfoMapping = wkrs.rows.reduce((acc, r) => {
                acc[r.workerID] = r;
                return acc;
            }, {} as { [id: string]: IWorkerInfo });
            const showWorkers = wkrs.rows.reduce((acc, r) => {
                acc[r.workerID] = true;
                return acc;
            }, {} as {[id:string]:boolean});
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

    useEffect(() => {
        formatData(state, setState);
    }, [state.rawData, state.showCategories]);

    let names: { id: string; name: string; }[] = [];
    let categoryNames: { id: string; name: string; }[] = [];
    if (state.byWorkerByCat && state.byWorkerByCat.workerIds) {
        names = state.byWorkerByCat.workerIds.map(id => {
            const wi = state.workerInfoMapping[id];
            if (!wi) {
                return {
                    id,
                    name: id,
                }
            } else {
                return {
                    id,
                    name: `${wi.firstName} ${wi.lastName}`
                }
            }
        });
        names = sortBy(names, 'name') as { id: string; name: string;}[];

        categoryNames = state.byWorkerByCat.catIds.map(id => {
            const name = state.expenseCategoriesMapping[id] || id;            
            return {
                id,
                name,
            }
        });
    }
    

    const amtDsp = (amt: number) => {
        if (!amt) return 0;
        return amt.toFixed(2);
    }
    return <div><EditDropdown context={{
        disabled: false,
        curSelection: state.curYearSelection || {},
        setCurSelection: s => {
            setState({
                ...state,
                dspYear: s?.value || '',
                curYearSelection: s || {},
            })
        },
        getCurSelectionText: o => o.label || '',
        options: state.curYearOptions,
        setOptions: ()=>{},
        loadOptions: async () => [],
    }}></EditDropdown>
        <div>
            <div className="container">
            {
                state.expenseCategories.map((exp,keyi) => {
                    return <>
                        <input type="checkbox" className="form-check-input" id="exampleCheck1"
                            checked={state.showCategories[exp.id]}
                            onClick={() => {
                                setState(prev => ({
                                    ...prev,
                                    showCategories: {
                                        ...state.showCategories,
                                        [exp.id]: !state.showCategories[exp.id],
                                    }
                                }));
                            }}
                        ></input>
                        <span className="border" key={keyi}  >{exp.name}</span>
                        <span> </span>
                        </>
                })
                }
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        {
                            categoryNames.map((n,keyi) => {
                                return <th scope="col" key={keyi}>{n.name}</th>        
                            })
                        }
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        names.map((n, tri) => {
                            return <tr key={tri}>
                                <th scope="row">{n.name}</th>
                                {
                                    categoryNames.map((cat, keyi) => {
                                        return <td scope="col" key={keyi}>{
                                            amtDsp(state.byWorkerByCat.byWorker[n.id][cat.id]?.amount)
                                        }</td>
                                    })
                                }
                                <td>{amtDsp(state.byWorkerByCat.byWorkerTotal[n.id].total)}</td>
                            </tr>
                        })
                    }
                    {
                        <tr>
                            <th>Grand Total:</th>
                            {
                                categoryNames.map((cat, keyi) => {
                                    return <td scope="col" key={keyi}>{
                                        amtDsp(state.byWorkerByCat.byCats[cat.id]?.total)
                                    }</td>
                                })
                            }
                            <td>{amtDsp(state.byWorkerByCat?.total)}</td>
                        </tr>
                    }
                </tbody>
            </table>            
        </div>
    </div>
}

function getDataForYYYY(state: IYearlyMaintenanceReportState, setState: React.Dispatch<React.SetStateAction<IYearlyMaintenanceReportState>>) {
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
        setState(prev=>({
            ...prev,
          rawData: dataRows,  
        }))
        //formatData(state, setState);
    });
}


function formatData(state: IYearlyMaintenanceReportState, setState: React.Dispatch<React.SetStateAction<IYearlyMaintenanceReportState>>) {
    const dataRows = state.rawData;
    const getSet = (obj: any, id: string, init: object) => {
        let r = obj[id];
        if (!r) {
            r = init || {};
            obj[id] = r;
        }
        return r;
    }
    const byWorkerByCat = dataRows.reduce((acc, d) => {
        if (!state.showWorkers[d.workerID]) return acc;
        if (!state.showCategories[d.expenseCategoryId]) return acc;

        if (!acc.workerIdHashFind[d.workerID]) {
            acc.workerIdHashFind[d.workerID] = true;
            acc.workerIds.push(d.workerID);
        }
        if (!acc.catIdHashFind[d.expenseCategoryId]) {
            acc.catIdHashFind[d.expenseCategoryId] = true;
            acc.catIds.push(d.expenseCategoryId);
        }
        const wkr = getSet(acc.byWorker, d.workerID, {});
        const exp = getSet(wkr, d.expenseCategoryId, {
            amount: 0,
            items: [],
        });
        exp.amount += d.amount;
        exp.items.push(d);

        const wkrTotal = getSet(acc.byWorkerTotal, d.workerID, {total: 0}) as IWithTotal;
        wkrTotal.total += d.amount;

        const byCats = getSet(acc.byCats, d.expenseCategoryId, { total: 0 }) as IWithTotal;
        byCats.total += d.amount;
        acc.total += d.amount;
        return acc;
    }, {
        byWorker: {},
        byCats: {},
        total: 0,
        workerIds: [] as string[],
        workerIdHashFind: {},
        catIds: [],
        catIdHashFind: {},
        byWorkerTotal: {},
    } as IByWorkerByCat);
    setState(prev => ({
        ...prev,
        byWorkerByCat,
    }));
}