import React from 'react';
import GenList from './GenList';
import {fmtDate} from './util';

function PaymentList() {
    return <GenList table={'rentPaymentInfo'}
        fieldFormatter={
            (val,fieldName) => {
                if(fieldName==='receivedDate') {
                    return fmtDate(val);
                }
                return val;
            }
        }
        processForeignKey={
            (fk,datas) => {
                return datas.map(data => {
                    return {
                        value: data[fk.field],
                        label: data['comment'],
                    }
                })
            }
        }
        displayFields={
            //actualy don't need to do this
            [
                {field: 'receivedDate',desc: 'Date Received',},
                {field: 'receivedAmount',desc: 'Received Amount',},
                {field: 'paidBy',desc: 'Paid By',},
                {field:'leaseComment', desc:'Lease'}
                //{field: 'ownerID',desc: 'Owner ID',require: true,foreignKey: {table: 'ownerInfo',field: 'ownerID'}},
            ]
        }
        loadMapper={
            (type,fields) => {
                if(type==='fields') {
                    return fields;
                }
                if(type==='joins') {
                    return {
                        'leaseInfo': {
                            houseID: 'houseID',
                            comment: 'leaseComment',
                        }
                    }
                }
            }
        }
        title={'Payment List'} />
}

export default PaymentList;