import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { getMaintenanceReport, getPaymnents } from '../aapi';
import { sumBy } from 'lodash';

export const TOTALCOLNAME = 'coltotal';
export const fMoneyformat = amt=> {
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

const getInitExpenseTableData = () => ({
    dateKeys: {}, //temp dedup 
    monthes: [],
    monthlyTotal: {},
    categoriesByKey: {
        [TOTALCOLNAME]: { 
            total: 0,
        }
    },
    categoryNames: [],
});

export const IncomeExpensesContext = React.createContext();

export function JJDataRoot(props) {
    const {ownerInfo} = props.dataRootParam;
    const [expenseData, setExpenseData] = useState(getInitExpenseTableData);
    const [payments, setPayments] = useState([]);
    const [paymentsByMonth, setPaymentsByMonth] = useState({
        monthNames: [],
        [TOTALCOLNAME]:{total:0}
    });
    const [allMonthes, setAllMonths] = useState([]);


    //month selection states
    const [monthes, setMonthes] = useState([]);
    const [curMonthSelection, setCurMonthSelection] = useState({label: ''});
    const [selectedMonths, setSelectedMonths] = useState({});



    function addMonths(mons) {
        setAllMonths(orig => {
            const r = orig.concat(mons).reduce((acc, m) => {
                if (!acc.dict[m]) {
                    acc.dict[m] = true;
                    acc.res.push(m);
                }
                return acc;
            }, {
                dict: {},
                res: []
            }).res;
            r.sort();
            return r;
        });
    }
    useEffect(() => {
        setMonthes(allMonthes);
    }, [allMonthes]);
    
    //format data
    useEffect(() => {
        setMonthes(allMonthes.filter(m => selectedMonths[m]));
        
        calculateExpenseByDate(expenseData, selectedMonths);
        calculateIncomeByDate(paymentsByMonth, selectedMonths);
    }, [expenseData.originalData, paymentsByMonth.originalData, curMonthSelection, selectedMonths]);

    useEffect(() => {
        allMonthes.forEach(m => selectedMonths[m] = false);
        let lm;
        switch (curMonthSelection.value) {
            case 'LastMonth':
                lm = moment().subtract(1, 'month').format('YYYY-MM');
                selectedMonths[lm] = true;
                break;
            case 'Last3Month':
                lm = moment().subtract(3, 'month').format('YYYY-MM');
                allMonthes.forEach(m => {
                    if (m >= lm)
                        selectedMonths[m] = true;
                });
                break;
            case 'Y2D':
                lm = moment().startOf('year').format('YYYY-MM');
                allMonthes.forEach(m => {
                    if (m >= lm)
                        selectedMonths[m] = true;
                });
                break;
            case 'LastYear':
                lm = moment().startOf('year').format('YYYY-MM');
                allMonthes.forEach(m => {
                    if (m < lm)
                        selectedMonths[m] = true;
                });
                break;
            default:
                allMonthes.forEach(m => selectedMonths[m] = true);
                break;
        }
        setSelectedMonths({ ...selectedMonths });
    }, [expenseData.originalData, paymentsByMonth.originalData,curMonthSelection]);
    


    const beginReLoadPaymentData = ownerInfo=>{
        return getPaymnents(ownerInfo).then(r => {
            r = r.map(r => {
                return {
                    ...r,
                    date: moment(r.date).format('YYYY-MM-DD'),
                    month: moment(r.date).format('YYYY-MM'),
                }
            }).sort((a, b) => {
                if (a.date > b.date) return 1;
                if (a.date < b.date) return -1;
                return 0;
            });
            r = r.reduce((acc, r) => {
                if (acc.curMon !== r.month) {
                    acc.curMon = r.month;
                    acc.total = 0;
                }
                acc.total += r.amount;
                r.total = acc.total;
                acc.res.push(r);
                return acc;
            }, {
                    res: [],
                    curMon: null,
                total: 0,
            });
            setPayments(r.res);

            const pm = r.res.reduce((acc, p) => {
                const month = moment(p.date).format('YYYY-MM');
                let m = acc.months[month];
                acc.months[TOTALCOLNAME].total += p.amount;
                if (!m) {
                    m = {
                        month,
                        total: 0,
                    };
                    acc.months[month] = m;
                    acc.monthNames.push(month);
                }
                m.total += parseFloat(p.amount);
                return acc;
            }, {
                months: {
                    [TOTALCOLNAME]: {
                        month: 'Total',
                        total: 0,
                    }
                },
                monthNames: [],
            });
            pm.months.monthNames = pm.monthNames.sort();
            pm.months.originalData = r.res;
            addMonths(pm.monthNames);
            setPaymentsByMonth(pm.months);
        });        
    }

    useEffect(() => {
        getMaintenanceReport().then(d => {
            const maintenceData = d.reduce((acc, r) => {
                const month = moment(r.month).add(2,'days').format('YYYY-MM');
                if (!acc.dateKeys[month]) {
                    acc.dateKeys[month] = true;
                    acc.monthes.push(month);
                }
                let cats = acc.categoriesByKey[r.category];
                if (!cats) {
                    cats = { [TOTALCOLNAME]: 0, order: r.displayOrder };
                    acc.categoriesByKey[r.category] = cats;
                    acc.categoryNames.push(r.category);
                }
                const ctotal = acc.categoriesByKey[TOTALCOLNAME];
                cats[month] = r.amount;
                ctotal[month] = (ctotal[month] || 0) + r.amount;
                cats[TOTALCOLNAME] = 0;
                acc.monthlyTotal[month] = (acc.monthlyTotal[month] || 0) + r.amount;
                return acc;
            }, getInitExpenseTableData());
            addMonths(maintenceData.monthes);
            maintenceData.originalData = d;
            setExpenseData(maintenceData);
            calculateExpenseByDate(maintenceData)
        });
        
        beginReLoadPaymentData(ownerInfo);
    }, [ownerInfo]);
    
    function checkDate(mon, selectedMonths) {
        if (mon === TOTALCOLNAME) return true;
        if (!selectedMonths) return true;
        return selectedMonths[mon];
    }
    const calculateExpenseByDate = (expenseData, dateSel) => {
        const { monthes,
            categoriesByKey,
            categoryNames } = expenseData;
        [...categoryNames,TOTALCOLNAME].map(cn => {
            const cat = categoriesByKey[cn]
            cat[TOTALCOLNAME] = monthes.reduce((acc, mon) => {
                if (!checkDate(mon, dateSel)) return acc;
                return acc + (cat[mon] || 0);
            }, 0)
        });
        setExpenseData({
            ...expenseData,
            categoriesByKey,
        })
    };

    const calculateIncomeByDate = (incomeData, selectedMonths) => {

        //console.log(incomeData);
        if (!incomeData[TOTALCOLNAME] ) return;
        incomeData[TOTALCOLNAME].total = 0;
        
        incomeData[TOTALCOLNAME].total = sumBy(incomeData.monthNames.filter(n => checkDate(n, selectedMonths)).map(n=>incomeData[n]), 'total');
        setPaymentsByMonth(incomeData)
    };
    return <IncomeExpensesContext.Provider value={
        {
            ownerInfo,
            expenseData,
            payments,
            paymentsByMonth,
            calculateExpenseByDate,
            calculateIncomeByDate,
            allMonthes,
            monthes, setMonthes,
            curMonthSelection, setCurMonthSelection,
            selectedMonths, setSelectedMonths,
            beginReLoadPaymentData,
        }
    }>
        { props.children}
    </IncomeExpensesContext.Provider>;
}