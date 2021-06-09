import { each } from 'bluebird';
import sortBy from 'lodash/sortBy';
import { TOTALCOLNAME,fMoneyformat } from './rootData';
export function getPaymentsByMonthAddress(paymentsByMonth, opts) {
    if (!opts) opts = {
        isGoodMonth: () => true,
        isGoodHouseId: () => true,
        getHouseShareInfo: ()=>[],
    };
    const { isGoodMonth, isGoodHouseId, getHouseShareInfo } = opts;
    const calcHouseSpreadShare = (d, isNotRent) => {
        if (!isNotRent) return d;
        //need to return based on enabled house shares.
        const houseInfo = getHouseShareInfo();
        if (!houseInfo.length)
            return d;
        const total = parseInt(d * 100);
        const eachShare = parseInt(total / houseInfo.length);
        const anchorShare = total - (eachShare * (houseInfo.length - 1));
        
        return houseInfo.reduce((acc, h) => {            
            if (isGoodHouseId(h.id)) {
                acc += h.isAnchor ? anchorShare : eachShare;
            }
            return acc;
        },0)/100.0;
    }
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
                isNotRent,
                addressId: d.addressId,
                address: d.address,
                displayName: isNotRent ? d.paymentTypeName: d.address,
                [TOTALCOLNAME]: 0,
            };
            catByKey[catId] = addData;
            catAry.push(addData);
        }

        let monData = addData[d.month];
        if (!monData) {
            monData = {
                amount: 0,
            };
            addData[d.month] = monData;
        }
        const damount = d.amount; //calcHouseSpreadShare(d.amount, isNotRent);
        
        monData[TOTALCOLNAME] += damount;
        acc.total += damount;
        
        if (!acc.monthByKey[d.month]) {
            acc.monthByKey[d.month] = true;
            acc.monthAry.push(d.month);
        }
        monData.amount += damount;        
            addData[TOTALCOLNAME] += damount;
            acc.monthTotal[d.month] = (acc.monthTotal[d.month] || 0) + damount;        
        return acc;
    }, {
        monthAry: [],
        monthByKey: {},
        houseAry: [],
        houseByKey: {},

        nonRentByKey: {},
        nonRentAry: [],

        monthTotal: {},
        total: 0,
    });

    monAddr.monthAry.sort();
    ['houseAry', 'nonRentAry'].forEach(name => {
        monAddr[name] = sortBy(monAddr[name], ['displayName']);
    })    

    return monAddr;
}