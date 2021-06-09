import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { getMaintenanceReport, getPaymnents, getHouseAnchorInfo } from '../aapi';
import { sumBy, sortBy, pick, uniqBy, uniq } from 'lodash';

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
    const [rawExpenseData, setRawExpenseData] = useState([]);
    const [payments, setPayments] = useState([]);
    const [paymentsByMonth, setPaymentsByMonth] = useState({
        monthNames: [],
        [TOTALCOLNAME]:{total:0}
    });
    const [allMonthes, setAllMonths] = useState([]);
    const [allHouses, setAllHouses] = useState([]); //{houseID, address}

    const [houseAnchorInfo, setHouseAnchorInfo] = useState([]);

    //month selection states
    const [monthes, setMonthes] = useState([]);
    const [curMonthSelection, setCurMonthSelection] = useState({label: ''});
    const [selectedMonths, setSelectedMonths] = useState({});
    const [selectedHouses, setSelectedHouses] = useState({});


    const TOTALHOUSECOUNT = 5;

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

    function addHouses(housesAll) {
        const houses = uniqBy(housesAll.map(h => pick(h, ['houseID', 'address'])), 'houseID').filter(h => h.address);
        setAllHouses(orig => {
            const r = orig.concat(houses).reduce((acc, m) => {
                if (!acc.dict[m.houseID]) {
                    acc.dict[m.houseID] = true;
                    acc.res.push(m);
                }
                return acc;
            }, {
                dict: {},
                res: []
            }).res;            
            return sortBy(r,['address']);
        });
    }
    useEffect(() => {
        setMonthes(allMonthes);

    }, [allMonthes]);
    
    //format data
    useEffect(() => {
        setMonthes(allMonthes.filter(m => selectedMonths[m]));
        
        calculateIncomeByDate(paymentsByMonth, selectedMonths, selectedHouses);
    }, [rawExpenseData, paymentsByMonth.originalData, curMonthSelection, selectedMonths]);

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
        setSelectedHouses(allHouses.reduce((acc, h) => {
            acc[h.houseID] = true;
            return acc;
        }, {}));
    }, [rawExpenseData, paymentsByMonth.originalData,curMonthSelection]);
    


    const beginReLoadPaymentData = ownerInfo => {
        getHouseAnchorInfo(ownerInfo).then(r => {
            setHouseAnchorInfo(r);
        })
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

            setPayments(r);

            const pm = r.reduce((acc, p) => {
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
            pm.months.originalData = r;
            //addMonths(pm.monthNames);
            addMonths(uniq(r.map(r=>r.month)))
            addHouses(r);
            setPaymentsByMonth(pm.months);
        });        
    }

    useEffect(() => {
        getMaintenanceReport(ownerInfo).then(d => {
            setRawExpenseData(d);           
        });
        
        beginReLoadPaymentData(ownerInfo);
    }, [ownerInfo]);
    
    function checkDate(mon, selectedMonths) {
        if (mon === TOTALCOLNAME) return true;
        if (!selectedMonths) return true;
        return selectedMonths[mon];
    }   

    const calculateIncomeByDate = (incomeData, selectedMonths, selectedHouses) => {

        //console.log(incomeData);
        if (!incomeData[TOTALCOLNAME] ) return;
        incomeData[TOTALCOLNAME].total = 0;
        
        incomeData[TOTALCOLNAME].total = sumBy(incomeData.monthNames.filter(n => checkDate(n, selectedMonths)).map(n=>incomeData[n]), 'total');
        setPaymentsByMonth(incomeData)
    };
    return <IncomeExpensesContext.Provider value={
        {
            ownerInfo,
            rawExpenseData,
            payments,
            paymentsByMonth,
            calculateIncomeByDate,
            allMonthes,
            allHouses,
            houseAnchorInfo,
            monthes, setMonthes,
            curMonthSelection, setCurMonthSelection,
            selectedMonths, setSelectedMonths,
            selectedHouses, setSelectedHouses,
            beginReLoadPaymentData,
            paymentCalcOpts: {
                isGoodMonth: m => selectedMonths[m],
                isGoodHouseId: id => selectedHouses[id],
                getHouseShareInfo: () => [...houseAnchorInfo],
            },
        }
    }>
        { props.children}
    </IncomeExpensesContext.Provider>;
}