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
        
        let dispOrder = 0;
        const isNotRent = d.paymentTypeName !== 'Rent';
        if (isNotRent) {
            //hack;
            d.addressId = d.paymentTypeName;
            d.houseID = d.addressId;
            d.address = d.paymentTypeName;
            dispOrder = 9999;
        } else {
            if (!isGoodHouseId(d.houseID)) return acc;
        }
        let addData = acc.houseByKey[d.addressId];
        if (!addData) {
            addData = {
                addressId: d.addressId,
                address: d.address,
                [TOTALCOLNAME]: 0,
                dispOrder,
            };
            acc.houseByKey[d.addressId] = addData;
            acc.houseAry.push(addData);
        }

        let monData = addData[d.month];
        if (!monData) {
            monData = {
                amount: 0,
            };
            addData[d.month] = monData;
        }
        const damount = calcHouseSpreadShare(d.amount, isNotRent);
        if (isGoodHouseId(d.addressId) || isNotRent) {
            monData[TOTALCOLNAME] += damount;
            acc.total += damount;
        }
        if (!acc.monthByKey[d.month]) {
            acc.monthByKey[d.month] = true;
            acc.monthAry.push(d.month);
        }
        monData.amount += damount;
        if (isGoodHouseId(d.addressId) || isNotRent) {
            addData[TOTALCOLNAME] += damount;
            acc.monthTotal[d.month] = (acc.monthTotal[d.month] || 0) + damount;
        }
        return acc;
    }, {
        monthAry: [],
        monthByKey: {},
        houseAry: [],
        houseByKey: {},
        monthTotal: {},
        total: 0,
    });

    monAddr.monthAry.sort();
    monAddr.houseAry = sortBy(monAddr.houseAry, ['dispOrder','address']);

    return monAddr;
}