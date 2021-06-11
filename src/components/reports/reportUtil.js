import { each } from 'bluebird';
import moment from 'moment';
import sortBy from 'lodash/sortBy';
import { TOTALCOLNAME,fMoneyformat } from './rootData';
export function getPaymentsByMonthAddress(paymentsByMonth, opts) {
    if (!opts) opts = {
        isGoodMonth: () => true,
        isGoodHouseId: () => true,
        getHouseShareInfo: ()=>[],
    };
    const { isGoodMonth, isGoodHouseId, getHouseShareInfo } = opts;
    ///
    /// paymentsByMonth: Array of
//     {
//     "paymentID": "6ed8ccd0-c428-11eb-b1ce-cdccdf295589",
//     "receivedDate": "2020-09-02T04:00:00.000Z",
//     "receivedAmount": 830,
//     "paidBy": null,
//     "notes": "",
//     "month": "2020-09",
//     "paymentTypeID": "6ed65bd0-c428-11eb-b1ce-cdccdf295589",
//     "houseID": "69e0acc0-c428-11eb-b1ce-cdccdf295589",
//     "paymentProcessor": null,
//     "vdPosControl": null,
//     "created": "2021-06-03T04:59:10.000Z",
//     "modified": "2021-06-03T04:59:10.000Z",
//     "paymentTypeName": "Rent",
//     "includeInCommission": "1",
//     "address": "xxxxx addr",
//     "addressId": "69e0acc0-c428-11eb-b1ce-cdccdf295589",
//     "source": null,
//     "ownerName": "xxx",
//     "ownerID": "e6634780-c1cb-11eb-8bff-37dbc12ce7aa",
//     "date": "2020-09-02",
//     "amount": ###,
//     "total": ###
// }

    
    const monAddr = paymentsByMonth.reduce((acc, d) => {
        //console.log(d);
        if (!isGoodMonth(d.month)) return acc;        
        if (!isGoodHouseId(d.houseID)) return acc;
        const isNotRent = d.paymentTypeName !== 'Rent';
                
        const catByKey = isNotRent ? acc.nonRentByKey : acc.houseByKey;
        const catAry = isNotRent ? acc.nonRentAry : acc.houseAry;
        const catId = isNotRent ? d.paymentTypeName : d.addressId;
        let addData = catByKey[catId];
        if (!addData) {
            addData = {
                monthes: {},
                isNotRent,
                addressId: d.addressId,
                address: d.address,
                displayName: isNotRent ? d.paymentTypeName : d.address,
                records: [],
                total: 0,
            };
            catByKey[catId] = addData;
            catAry.push(addData);
        }

        let monData = addData.monthes[d.month];
        if (!monData) {
            monData = {
                amount: 0,
                records: [],
            };
            addData.monthes[d.month] = monData;
        }
        const damount = d.amount; //calcHouseSpreadShare(d.amount, isNotRent);
        
        //monData[TOTALCOLNAME] += damount;
        acc.total += damount;
        
        if (!acc.monthByKey[d.month]) {
            acc.monthByKey[d.month] = true;
            acc.monthAry.push(d.month);
        }
        monData.amount += damount;
        monData.records.push(d);
        addData.total += damount;
        addData.records.push(d);
        acc.monthTotal[d.month] = (acc.monthTotal[d.month] || 0) + damount;
        if (!acc.dbgMonthTotalRecords[d.month]) {
            acc.dbgMonthTotalRecords[d.month] = [];
        }
        acc.dbgMonthTotalRecords[d.month].push(d);
        return acc;
    }, {
        monthAry: [],
        monthByKey: {},
        houseAry: [],
        houseByKey: {},

        nonRentByKey: {},
        nonRentAry: [],

        monthTotal: {},
        dbgMonthTotalRecords: {},
        total: 0,
    });

    monAddr.monthAry.sort();
    ['houseAry', 'nonRentAry'].forEach(name => {
        monAddr[name] = sortBy(monAddr[name], ['displayName']);
    })    

    return monAddr;
}


export function getMaintenanceData(maintenanceRecordsRaw, opts) {
    if (!opts) opts = {
        isGoodMonth: () => true,
        isGoodHouseId: () => true,
        getHouseShareInfo: () => [],
    };
    const maintenanceRecords = maintenanceRecordsRaw.reduce((acc, r) => {
        const key = `${r.month}-${r.houseID}-${r.expenseCategoryName}`;
        let keyData = acc.keys[key];
        if (!keyData) {
            keyData = {
                month: r.month,
                amount: 0,
                category: r.category,
                address: r.address,
                houseID: r.houseID,
                records: [],
            };
            acc.keys[key] = keyData;
            acc.data.push(keyData);
        }
        keyData.amount += r.amount;
        keyData.records.push(r);
        return acc;
    }, {
        data: [],
        keys:{}
    }).data;
    const { isGoodMonth, isGoodHouseId, getHouseShareInfo } = opts;
    const calcHouseSpreadShare = r => {
        const ramount = r.amount;
        if (isGoodHouseId(r.houseID)) {
            return {
                ...r, amount: ramount,
                calcInfo: [
                    {
                        curTotal: ramount,
                        house: r,
                        info: `${r.address} ==> ${(ramount).toFixed(2)}`,
                    }
            ]};
        }
        if (r.address) return { amount: 0 }; //belong to a not shown house.
        //need to return based on enabled house shares.
        const houseInfo = getHouseShareInfo();
        if (!houseInfo.length)
            return { ...r, amount: ramount, message:'Warning: no house found return as is' };
        const total = Math.round(ramount * 100);
        const eachShare = parseInt(total / houseInfo.length);
        const anchorShare = total - (eachShare * (houseInfo.length - 1));

        const calcRes = houseInfo.reduce((acc, h) => {
            if (isGoodHouseId(h.id)) {
                const toAdd = h.isAnchor ? anchorShare : eachShare;
                const curTotal = acc.amount;
                acc.amount += toAdd;
                acc.calcInfo.push({
                    curTotal,
                    house: h,
                    info: `${h.address} ${(toAdd/100.0).toFixed(2)} cumulated: ${(acc.amount/100).toFixed(2)}`,
                });                
            }
            return acc;
        }, {
            amount: 0,
            calcInfo:[],
        });
        return {
            ...r,
            amount: calcRes.amount / 100.0,
            calcInfo: calcRes.calcInfo,
        }
    }

    const maintenceData = maintenanceRecords.reduce((acc, r) => {
        const month = moment(r.month).add(2, 'days').format('YYYY-MM');
        if (!isGoodMonth(month)) return acc;
        if (!isGoodHouseId(r.houseID) && !r.houseID) return acc;
        
        let monthData = acc.monthByName[month];
        if (!monthData) {
            acc.monthByName[month] = {
                total: 0,
            };
            acc.monthes.push(month);
        }
        let cats = acc.categoriesByKey[r.category];
        if (!cats) {
            cats = { };
            acc.categoriesByKey[r.category] = cats;
            acc.categoryNames.push(r.category);
        }
        
        const calcInfo = calcHouseSpreadShare(r);
        const amount = calcInfo.amount;
        let catMonth = cats[month];
        if (!catMonth) {
            catMonth = {
                amount: 0,
                records: [],
                amountCalcParts: [],
            }
            cats[month] = catMonth;
        }
        catMonth.amount += amount;
        if (amount)
            catMonth.amountCalcParts.push(calcInfo);
        catMonth.records.push(r);
        acc.categoryTotals[r.category] = (acc.categoryTotals[r.category] || 0) + amount;
        acc.monthlyTotal[month] = (acc.monthlyTotal[month] || 0) + amount;

        acc.total += amount;
        return acc;
    }, {
        monthByName: {},
        monthes: [],
        categoriesByKey: {},
        categoryNames: [],
        categoryTotals: {},
        monthlyTotal: {},
        total: 0,
    });

    const sortLowOthers = cats => {
        const others = 'Others';
        const res = cats.filter(k => k !== others);
        res.sort();
        if (cats.filter(k => k === others).length) {
            res.push(others);
        }
        return res;
    }

    maintenceData.categoryNames = sortLowOthers(maintenceData.categoryNames);
    maintenceData.getCatMonth = (cat, mon) => {
        const catMon = maintenceData.categoriesByKey[cat];
        if (!catMon) return {};
        return catMon[mon] || {};
    };
    return maintenceData;
}