import React, { useState, useEffect } from 'react';
import { fMoneyformat } from '../reports/rootData';
import { MonthRange } from '../reports/monthRange';
import { getPaymentsByMonthAddress, getMaintenanceData } from '../reports/reportUtil';
import { Modal, Container, Button } from 'react-bootstrap';
import moment from 'moment';
import { saveToGS } from '../reports/utils/updateGS';
import { sortBy } from 'lodash';
import EditDropdown, {IOptions} from '../paymentMatch/EditDropdown';
import { IIncomeExpensesContextValue, IPayment } from '../reports/reportTypes';

export function YearlyIncomeByHouseReport(props: { jjctx: IIncomeExpensesContextValue}) {
    const jjctx = props.jjctx;
    const {
        payments,
        rawExpenseData,
        selectedHouses,
        monthes,
        //paymentCalcOpts,

        ownerInfo,
        houseAnchorInfo,

        //selectedMonths,
    } = jjctx;

    const [selectedMonths, setSelectedMonths] = useState<StringBoolHash>({});
    const [state, setState] = useState({
        dspYear: '',
        ownerID:'',
        curYearSelection: {} as IOptions,
        curYearOptions: [] as IOptions[],
    });

    interface StringBoolHash { [x: string]: boolean; };
    useEffect(() => {
        const years = sortBy(monthes.reduce((acc: { yearMap: StringBoolHash; yearAry: string[]; }, m: string) => {
            const year = m.substring(0, 4);
            if (!acc.yearMap[year]) {
                acc.yearMap[year] = true;
                acc.yearAry.push(year);
            }
            return acc;
        }, {
            yearMap: {},
            yearAry: [],
        }).yearAry, x=>-x);        
        
        const dspYear = ((years[1] || years[0]) || '').toString();
        console.log(`setting dspYear ${dspYear} length of ypar op=${years.length}`)
        
        setState(prev => ({
            ...prev,
            dspYear,
            ownerID: ownerInfo.ownerID,
            curYearOptions: years.map(y => ({ label: y, value: y })),
            curYearSelection: { label: dspYear, value: dspYear },
        }));                        
    }, [monthes]);

    useEffect(() => {
        const selectedMonths = monthes.reduce((acc: { [x: string]: boolean; }, m: string) => {
            if (m.substring(0, 4) === state.dspYear) {
                acc[m] = true;
            } else {
                acc[m] = false;
            }
            return acc;
        }, {});
        setSelectedMonths(selectedMonths);        
    }, [state.dspYear]);

    const paymentCalcOpts = {
        isGoodMonth: (m: string) => selectedMonths[m],
        isGoodHouseId: (id: string | number) => selectedHouses[id],
        getHouseShareInfo: () => [...houseAnchorInfo],
    };

    const monAddr = getPaymentsByMonthAddress(payments, paymentCalcOpts);

    const calculatedMaintData = getMaintenanceData(rawExpenseData, paymentCalcOpts);

    interface IShowDetailsData {
        amount: number;
        address: string;
        notes: string;
        date: string;
        debugText?: string;
    }
    const [showDetail, setShowDetail] = useState<IShowDetailsData[]|null>(null);
    const [showExpenseDetail, setShowExpenseDetail] = useState<{debugText:string}[] | null>(null);

    const saveCsvGS = (csv:boolean) => {
        var link = document.createElement("a");
        const csvContent = [];

        const fMoneyformat = (d: number) => (d || d === 0) ? d.toFixed(2) : '';
        csvContent.push(['', 'Total', ...monthes]);
        monAddr.houseAry.filter(h => (selectedHouses[h.addressId])).forEach((house, key) => {
            csvContent.push([house.address, fMoneyformat(house.total),
            ...monthes.map(mon => fMoneyformat((house.monthes[mon] || {}).amount))
            ]);
        })
        
        csvContent.push(['Sub Total:', fMoneyformat(monAddr.total),
            ...monthes.map((name, key) => {
                const mon = monAddr.monthTotal[name];
                if (!mon && mon !== 0) return '';
                return fMoneyformat(mon);
            })
        ]);

        csvContent.push(['']);
        csvContent.push(['Expenses', '', ...monthes.map(() => '')]);


        [...calculatedMaintData.categoryNames].forEach(cat => {
            csvContent.push([cat, fMoneyformat(calculatedMaintData.categoryTotals[cat]),
                ...monthes.map(mon => fMoneyformat(calculatedMaintData.getCatMonth(cat, mon).amount))
            ])

        })

        csvContent.push(['Sub Total', fMoneyformat(calculatedMaintData.total),
            ...monthes.map(mon => fMoneyformat((calculatedMaintData.monthlyTotal[mon] || 0)))
        ])

        csvContent.push(['']);
        csvContent.push(['Net Income', fMoneyformat((monAddr.total - calculatedMaintData.total)),
            ...monthes.map(mon => {
                const incTotal = monAddr.monthTotal[mon] || 0;
                const cost = calculatedMaintData.monthlyTotal[mon] || 0;
                return fMoneyformat((incTotal - cost));
            })
        ]);


        if (csv) {
            link.href = window.URL.createObjectURL(
                new Blob([csvContent.map(c => c.join(', ')).join('\n')], { type: "application/txt" })
            );
            link.download = `report-cashflow.csv`;

            document.body.appendChild(link);
            link.click();
            setTimeout(function () {
                window.URL.revokeObjectURL(link.href);
            }, 200);
        } else {
            saveToGS(csvContent)
        }
    }
    return <>
        <Modal show={!!showDetail} onHide={() => {
            setShowDetail(null);
        }}>
            <Modal.Header closeButton>
                <Modal.Body>{(showDetail || [] as IShowDetailsData[]).map(d => {
                    return <div>{d.amount.toFixed(2)} {d.date} {d.address} {d.notes} {d.debugText}</div>
                })}</Modal.Body>
            </Modal.Header>
            <Container>
            </Container>
        </Modal>

        <Modal show={!!showExpenseDetail} onHide={() => {
            setShowExpenseDetail(null);
        }}>
            <Modal.Header closeButton>
                <Modal.Body>{showExpenseDetail?showExpenseDetail.map(d => {
                    return <div>{d.debugText}</div>
                }):''}</Modal.Body>
            </Modal.Header>
            <Container>
            </Container>
        </Modal>
        <MonthRange jjctx={jjctx}></MonthRange>
        <EditDropdown context={{
            disabled: false,
            curSelection: state.curYearSelection || {label:'', value:''},
            setCurSelection: s => {
                setState({
                    ...state,
                    dspYear: s?.value || '',
                    curYearSelection: s || {},
                })
            },
            getCurSelectionText: o => o.label || '',
            options: state.curYearOptions || [],
            setOptions: opt => { },
            loadOptions: async () => [],
        }}></EditDropdown>
        <table><tr>
            <td><Button onClick={() => saveCsvGS(true)}>CSV</Button></td>
            <td><Button onClick={() => saveCsvGS(false)}>Sheet</Button></td>
        </tr></table>
        <table className='table'>
            <tbody><tr>
                <td></td>
                <td className='tdRight'>Income</td>
                <td className='tdRight'>Expense</td>
                <td className='tdRight'>Revenue</td>
            </tr>
                {
                    monAddr.houseAry.filter(h => (selectedHouses[h.addressId])).map((house, key) => {
                        return <tr key={key}>
                            <td className=''>{house.address}</td>
                            <td className='tdRight'
                                onClick={() => {
                                    const all = monthes.reduce((acc,mon) => {
                                        const curHouseMon = house.monthes[mon];
                                        if (curHouseMon?.records) {
                                            acc = acc.concat(curHouseMon.records);
                                        }
                                        return acc;
                                    }, [] as IPayment[]);
                                    setShowDetail(all)
                                }}
                            >{fMoneyformat(house.total)}</td>
                            <td className='tdRight' onClick={() => {
                                setShowDetail(calculatedMaintData.byHouseIdOnly[house.addressId]?.records.map(r => {
                                    return {
                                        address: r.house.address,
                                        notes: r.info,
                                        amount: r.amount,
                                    } as IShowDetailsData;
                                }))
                            }}>
                                {fMoneyformat(calculatedMaintData.byHouseIdOnly[house.addressId]?.amount)}
                            </td>
                            <td className='tdRight'>
                                {fMoneyformat(house.total - calculatedMaintData.byHouseIdOnly[house.addressId]?.amount)}
                            </td>
                            {
                                false && monthes.map((mon, key) => {
                                    const curHouseMon = house.monthes[mon];
                                    return < td key={key} className='tdCenter' onClick={() => setShowDetail(curHouseMon?.records)}> {
                                        fMoneyformat(curHouseMon?.amount)

                                    }</td>
                                })
                            }
                        </tr>
                    })
                }
                {
                    //monAddr.nonRentAry.map((nonRent, key) => fMoneyformat(nonRent.total)
                    //    monthes.map((mon=>nonRent.monthes[mon].amount                    
                }
                <tr>

                    <td>Sub Total:
                    </td><td className='tdRight'>{fMoneyformat(monAddr.total)}</td>
                    {
                        //monthes.map((name, key) => monAddr.monthTotal[name]                            
                    }
                    <td className='tdRight'>{fMoneyformat(calculatedMaintData.totalExpByHouse)}</td>
                    <td className='tdRight'>{fMoneyformat(monAddr.total - calculatedMaintData.totalExpByHouse)}</td>
                </tr>

            </tbody>
        </table>
        <table className='table'>
            <tbody>
                <tr><td className='tdLeftSubHeader' colSpan={monthes.length + 2}>Expenses</td></tr>


                {
                    [...calculatedMaintData.categoryNames].map((cat, key) => {
                        return <tr key={key}>
                            <td className='tdLeftSubCategoryHeader'>{cat}</td><td className="tdCenter  tdTotalItalic">{fMoneyformat(calculatedMaintData.categoryTotals[cat])}</td>
                            {
                                monthes.map((mon, key) => {
                                    const catMon = calculatedMaintData.getCatMonth(cat, mon);
                                    return <td key={key} className="tdCenter" onClick={() => {
                                        if (catMon.amountCalcParts) {
                                            console.log('catMon')
                                            console.log(catMon)
                                            const msgs = catMon.amountCalcParts.reduce((acc, r) => {
                                                console.log(r)
                                                if (r.calcInfo) {
                                                    r.calcInfo.forEach(i => acc.push({
                                                        debugText: i.info
                                                    }));
                                                }
                                                return acc;
                                            }, [
                                                {
                                                    debugText: `For Total expense of ${catMon.amount.toFixed(2)}`
                                                },
                                                ...catMon.records.reduce((acc, r) => {
                                                    acc.push({
                                                        debugText: `=> ${r.amount} is from`
                                                    });
                                                    r.records.forEach(r => {
                                                        acc.push({
                                                            debugText: `===> ${moment(r.date).format('YYYY-MM-DD')} ${r.amount} ${r.comment} ${r.description}`
                                                        });
                                                    })
                                                    return acc;
                                                }, [] as { debugText:string}[]),
                                                {
                                                    debugText: '====== breakdowns '
                                                }
                                            ]);
                                            setShowExpenseDetail(msgs)
                                        }
                                    }}>{fMoneyformat(catMon.amount)}</td>
                                })
                            }
                        </tr>
                    })
                }
                <tr><td className='tdLeftSubCategoryHeader'>Sub Total</td><td className="tdCenter  tdTotalItalic">{
                    fMoneyformat(calculatedMaintData.total)
                }</td>
                    {
                        monthes.map((mon, key) => {
                            return <td key={key} className="tdCenter tdTotalItalic">{fMoneyformat((calculatedMaintData.monthlyTotal[mon] || 0))}</td>
                        })
                    }
                </tr>
                <tr>
                    <td colSpan={monthes.length + 2}></td>
                </tr>
                <tr>
                    <td className="tdLeftSubHeader tdButtomTotalCell">Net Income</td>
                    <td className="tdCenter tdTotalBold">{fMoneyformat((monAddr.total - calculatedMaintData.total))}</td>
                    {
                        monthes.map((mon, key) => {
                            const incTotal = monAddr.monthTotal[mon] || 0; //paymentsByMonth[mon] || {};
                            //const incTotal = inc.total || 0;
                            const cost = calculatedMaintData.monthlyTotal[mon] || 0;
                            return <td key={key} className='tdButtomTotalCell tdTotalBold tdCenter t'>{fMoneyformat((incTotal - cost))}</td>
                        })
                    }
                </tr>
            </tbody>
        </table>
    </>
}