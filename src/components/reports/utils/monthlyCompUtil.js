import { orderBy, sumBy, uniqBy } from 'lodash';
import moment from 'moment';

export function doCalc({
    curWorkerCompTop,
    payments,
    maintenanceRecords,
}) {
    let curWorkerComp = []; //orderBy(workerComps[curWorker.value] || [], ['address'], ['asc']);
    const paymentsByLease = payments.reduce((acc, p) => {
        let lp = acc[p.houseID];
        if (!lp) {
            lp = {
                total: 0,
                payments: [],
            };
            acc[p.houseID] = lp;
            acc.keys.push(p.houseID);
        }
        lp.total += p.receivedAmount;
        lp.payments.push(p);
        return acc;
    }, {
        keys: []
    });
    
    if (curWorkerCompTop) {
        if (paymentsByLease.keys.length) {
            curWorkerComp = orderBy(paymentsByLease.keys.map(houseID => {
                return {
                    ...curWorkerCompTop,
                    houseID,
                    address: paymentsByLease[houseID].payments[0].address,
                }
            }), ['address'], ['asc']);
        }
    }
    const cmpToLease = cmp => paymentsByLease[cmp.houseID] || { total: 0, payments: [] };
    const getCmpAmt = cmp => {
        if (cmp.type === 'percent')
            return cmpToLease(cmp).total * cmp.amount / 100;
        return cmp.amount;
    }

    const totalEarned = sumBy(curWorkerComp.map(getCmpAmt), x => x);
    const maintenanceRecordsByExpCat = maintenanceRecords.reduce((acc, r) => {
        let cat = acc.byCat[r.expenseCategoryName];
        if (!cat) {
            cat = {
                id: r.expenseCategoryId,
                name: r.expenseCategoryName,
                reimburse: r.expenseCategoryName !== 'Commission Fee',
                total: 0,
                items: [],
            };
            acc.byCat[r.expenseCategoryName] = cat;
            acc.cats.push(cat);
        }
        cat.total += r.amount;
        if (cat.reimburse) {
            acc.total += r.amount;
        }
        cat.items.push(r);
        return acc;
    }, {
        total: 0,
        byCat: {},
        cats: [],
    });
    maintenanceRecordsByExpCat.cats = orderBy(maintenanceRecordsByExpCat.cats, ['expCatDisplayOrder']);



    const rows = curWorkerComp.map((cmp, key) => {
        const lt = cmpToLease(cmp);
        if (!lt.payments.length) return;
        return {
            address: cmp.address,
            paymentAmount: lt.total,
            comp: getCmpAmt(cmp).toFixed(2),
            details: lt.payments.map(pmt => ({
                date: moment(pmt.receivedDate).format('YYYY-MM-DD'),
                paidBy: pmt.paidBy,
                amount: pmt.receivedAmount,
                desc: pmt.notes,
            }))
        }
    }).filter(x => x);
    const res = {
        totalPayments: sumBy(curWorkerComp.map(cmpToLease), 'total').toFixed(2),
        totalPaymentComp: totalEarned.toFixed(2),
        paymentRows: rows,
        paymentsFlattened: rows.reduce((acc, r, i) => {
            const drs = r.details.map(rd => {
                return {
                    date: rd.date,
                    amount: rd.amount,
                    address: r.address,
                    comp: `c-${i}-${r.comp}`,
                }
            });
            //drs.push({
            //    date: '-',
            //    amount: r.paymentAmount,
            //    address: '-',
            //    comp: r.comp,
            //})
            return acc.concat(drs);
        }, []),
    }

    const reimbusements = maintenanceRecordsByExpCat.cats.map((mr, key) => {
        if (!mr.reimburse) return;
        return {
            name: mr.name,
            amount: mr.total,
            rows: mr.items.map(itm => {
                return {
                    amount: itm.amount,
                    address: itm.address,
                    date: moment(itm.date).format('YYYY-MM-DD'),
                    desc: itm.description
                }
            })
        }
    }).filter(x => x);

    const reimbusementsFlattened = reimbusements.reduce((acc, r) => {
        const drs = r.rows.map(rr => {
            return {
                date: rr.date,
                name: r.name,
                amount: rr.amount,
                address: rr.address,
                desc: rr.desc,
            }
        });
        //drs.push({
        //    date: '-',
        //    name: r.name,
        //    amount: r.amount,
        //    address: '-',
        //    desc:'-'
        //})
        acc = acc.concat(drs)
        return acc;
    }, []);
    const reimbusementTotal = maintenanceRecordsByExpCat.total.toFixed(2);
    res.reimbusements = reimbusements;
    res.reimbusementsFlattened = reimbusementsFlattened;
    res.reimbusementTotal = reimbusementTotal;
    res.totalToBePaid = (totalEarned + maintenanceRecordsByExpCat.total).toFixed(2);

    const generateCsv = (curMonth) => {
        const doPad = true;
        const padRight = (s, len) => doPad ? (s || '').toString().padEnd(len) : s;


        const padNum = (num, w) => `\$${parseFloat(num).toFixed(2).padStart(w || 5)}`;

        const cmpiMapper = [
            {
                field: 'date',
                title: 'Received Date'
            }, {
                field: 'amount',
                title: 'Received Amount',
                format: padNum,
            },
            //{
            //    field: 'comp',
            //    title: 'Comp        ',
            //},
            {
                field: 'address',
                title: 'Address               ',
            },
            {
                field: '',
                title: '----'
            }
        ];
        const rembiMapper = [
            {
                field: 'date',
                title: 'Date      '
            }, {
                field: 'name',
                title: 'Category             '
            }, {
                field: 'address',
                title: 'Address               ',
            }, {
                field: 'amount',
                title: 'Amount      ',
                format: padNum,
            }, {
                field: 'desc',
                title: 'Description                                                '
            }
        ];

        const allColMaps = cmpiMapper.concat(rembiMapper);
        const fromColMapToCsv = allColMaps => {
            const mapper = allColMaps.map((fmt) => {
                return x => {
                    const v = typeof x === 'string' ? x : fmt.field ? x[fmt.field] : '';
                    const padder = fmt.format || padRight;
                    return padder(v, fmt.title.length)
                };
            });
            const csvContent = [allColMaps.map(c => c.title)];
            for (let i = 0; ; i++) {
                const cmpi = res.paymentsFlattened[i];
                const curLine = allColMaps.map(() => '');
                if (cmpi) {
                    for (let j = 0; j < cmpiMapper.length; j++) {
                        curLine[j] = mapper[j](cmpi);
                    }
                }
                const rembi = reimbusementsFlattened[i];
                if (rembi) {
                    for (let j = rembiMapper.length; j < mapper.length; j++) {
                        curLine[j] = mapper[j](rembi);
                    }
                }
                if (!cmpi && !rembi) break;
                csvContent.push(curLine.map((l, i) => l.padEnd(allColMaps[i].title.length)));
            }

            csvContent.push([]);
            let summary = [
                ['Total', res.totalPayments],
                ['Comp', res.totalPaymentComp, '', '', '', '', 'Total', res.reimbusementTotal],
                [`Total ${curMonth}`, res.totalToBePaid]
            ]
            summary.forEach(s => {
                s = s.map((itm, i) => {
                    return mapper[i](itm);
                });
                csvContent.push(s);
            });
            return csvContent;
        }

        const testSet = fromColMapToCsv(allColMaps.map(a => {
            return {
                ...a,
                title: a.title.trim(),
            }
        }));
        const setColWidth = testSet => {
            const colWidth = testSet.reduce((acc, r) => {
                return r.reduce((acc, ri, i) => {
                    if ((acc[i] || 0) < ri.length) {
                        acc[i] = ri.length;
                    }
                    return acc;
                }, acc);
            }, []);
            allColMaps.forEach((c, i) => {
                c.title = c.title.trim().padEnd(colWidth[i]);
            });
        };
        setColWidth(testSet);
        const csvContent = fromColMapToCsv(allColMaps);
        return csvContent;
    }
    return {
        curWorkerComp,
        totalEarned,        
        monthlyCompRes: res,
        generateCsv,
        maintenanceRecordsByExpCat,
        cmpToLease,
        getCmpAmt,
    }
}