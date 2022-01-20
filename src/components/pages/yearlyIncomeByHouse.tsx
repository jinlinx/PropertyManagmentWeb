import React, { useState, useEffect } from 'react';
import { fMoneyformat } from '../reports/rootData';
import { MonthRange } from '../reports/monthRange';
import { getPaymentsByMonthAddress, getMaintenanceData } from '../reports/reportUtil';
import { Modal, Container, Button } from 'react-bootstrap';
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

    const saveCsvGS = () => {
        var link = document.createElement("a");
        const csvContent = [];

        const fMoneyformat = (d: number) => (d || d === 0) ? d.toFixed(2) : '';
        csvContent.push(['Address', 'Income', 'Expense', 'Revenue']);

        monAddr.houseAry.filter(h => (selectedHouses[h.addressId])).map((house, key) => {
            csvContent.push(
                [
                    fMoneyformat(house.total),
                    fMoneyformat(calculatedMaintData.byHouseIdOnly[house.addressId]?.amount),
                    fMoneyformat(house.total - calculatedMaintData.byHouseIdOnly[house.addressId]?.amount)
                ]);
        });

        csvContent.push([monAddr.total, (calculatedMaintData.totalExpByHouse), (monAddr.total - calculatedMaintData.totalExpByHouse)]
            .map(fMoneyformat));
        link.href = window.URL.createObjectURL(
            new Blob([csvContent.map(c => c.join(', ')).join('\n')], { type: "application/txt" })
        );
        link.download = `report-cashflow.csv`;

        document.body.appendChild(link);
        link.click();
        setTimeout(function () {
            window.URL.revokeObjectURL(link.href);
        }, 200);
        
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
            <td><Button onClick={() => saveCsvGS()}>CSV</Button></td>
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
                <tr><td>Address</td><td className='tdRight'>Total</td>
                    {
                        [...calculatedMaintData.houses].map((house, key) => {
                            return <td className='tdRight' key={key}>{ house.address }</td>
                        })
                    }
                </tr>
                {
                    [...calculatedMaintData.categoryNames].map((cat, key) => {
                        return <tr key={key}>
                            <td className='tdRight'>{cat}</td><td className="tdRight">{fMoneyformat(calculatedMaintData.categoryTotals[cat])}</td>
                            {
                                calculatedMaintData.houses.map((house, key) => {
                                    const hcat = calculatedMaintData.byHouseIdByCat[house.houseID][cat];
                                    return <td key={key} className='tdRight'>
                                        {fMoneyformat(hcat?.amount)}
                                    </td>
                                })                                
                            }
                        </tr>
                    })
                }
                <tr><td className='tdLeftSubCategoryHeader'>Sub Total</td><td className="tdRight">{
                    fMoneyformat(calculatedMaintData.total)
                }</td>
                    {
                        calculatedMaintData.houses.map((house, key) => {
                            const hcat = calculatedMaintData.byHouseIdOnly[house.houseID];
                            return <td key={key} className='tdRight'>
                                {fMoneyformat(hcat?.amount)}
                            </td>
                        })                        
                    }
                </tr>
            </tbody>
        </table>
    </>
}