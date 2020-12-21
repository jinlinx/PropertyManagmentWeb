import React from 'react';
import GenList from './GenList';
import { fmtDate } from './util';

function PaymentList(props) {
    return <GenList 
    {...props}
    table={'rentPaymentInfo'}    
        displayFields={
            //actualy don't need to do this
            [
                {
                    field: 'receivedDate', desc: 'Date Received', dspFunc: fmtDate
                },
                {field: 'receivedAmount',desc: 'Received Amount',},
                {field: 'paidBy',desc: 'Paid By',},
                {field:'comment', desc:'Lease'}
                //{field: 'ownerID',desc: 'Owner ID',require: true,foreignKey: {table: 'ownerInfo',field: 'ownerID'}},
            ]
        }
        
        title={'Payment List'} />
}

export default PaymentList;