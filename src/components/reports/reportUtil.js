import sortBy from 'lodash/sortBy';
import { TOTALCOLNAME,fMoneyformat } from './rootData';
export function getPaymentsByMonthAddress(paymentsByMonth, opts) {
    if (!opts) opts = {
        isGoodMonth: () => true,
        isGoodHouseId: () => true,
    };
    const { isGoodMonth, isGoodHouseId } = opts;
    const monAddr = paymentsByMonth.reduce((acc, d) => {
        //console.log(d);
        if (!isGoodMonth(d.month)) return acc;
        
        let addData = acc.houseByKey[d.addressId];
        if (!addData) {
            addData = {
                addressId: d.addressId,
                address: d.address,
                [TOTALCOLNAME]:0,
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
        if (isGoodHouseId(d.addressId)) {
            monData[TOTALCOLNAME] += d.amount;
            acc.total += d.amount;
        }
        if (!acc.monthByKey[d.month]) {
            acc.monthByKey[d.month] = true;
            acc.monthAry.push(d.month);
        }
        monData.amount += d.amount;
        if (isGoodHouseId(d.addressId)) {
            addData[TOTALCOLNAME] += d.amount;
            acc.monthTotal[d.month] = (acc.monthTotal[d.month] || 0) + d.amount;
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
    monAddr.houseAry = sortBy(monAddr.houseAry, 'address');

    return monAddr;
}