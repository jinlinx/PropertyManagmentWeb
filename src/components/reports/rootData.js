import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { getMaintenanceReport, getPaymnents } from '../aapi';

export const TOTALCOLNAME = 'total';
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
    const [expenseData, setExpenseData] = useState(getInitExpenseTableData);
    const [payments, setPayments] = useState([]);
    const [paymentsByMonth, setPaymentsByMonth] = useState([]);
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
            setExpenseData(maintenceData);
            calculateExpenseByDate(maintenceData)
        });
        getPaymnents().then(r => {
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
                acc.months.total += p.amount;
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
                    total: 0,
                },
                monthNames: [],
            });
            pm.months.monthNames = pm.monthNames.sort();
            setPaymentsByMonth(pm.months);
        })
    }, []);
    
    function checkDate(mon, selectedDate) {
        if (mon === TOTALCOLNAME) return true;
        if (!selectedDate) return true;
        return mon >= selectedDate.label;
    }
    const calculateExpenseByDate = (expenseData, dateSel) => {
        const { monthes,
            categoriesByKey,
            categoryNames } = expenseData;
        [...categoryNames,TOTALCOLNAME].map(cn => {
            const cat = categoriesByKey[cn]
            cat.total = monthes.reduce((acc, mon) => {
                if (!checkDate(mon, dateSel)) return acc;
                return acc + (cat[mon] || 0);
            }, 0)
        });
        setExpenseData({
            ...expenseData,
            categoriesByKey,
        })
    };
    return <IncomeExpensesContext.Provider value={
        {
            expenseData,
            payments,
            paymentsByMonth,
            calculateExpenseByDate,
        }
    }>
        { props.children}
    </IncomeExpensesContext.Provider>;
}