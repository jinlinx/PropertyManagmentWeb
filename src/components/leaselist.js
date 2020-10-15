import React  from 'react';
import GenList from './GenList';
import {fmtDate} from './util';

function LeaseList(props) {  
    return <GenList 
    {...props}
    table={'leaseInfo'}

displayFields={
        //actualy don't need to do this
        [
            { field: 'deposit', desc: 'Deposit',  },
        { field: 'endDate', desc: 'End Date', dspFunc: fmtDate },
        { field: 'startDate', desc: 'Start Date', dspFunc: fmtDate },
            { field: 'houseAddress', desc: 'House'},
            { field: 'comment', desc: 'Comment' },
            { field: 'monthlyRent', desc: 'Monthly Rent' },
            //{field: 'ownerID',desc: 'Owner ID',require: true,foreignKey: {table: 'ownerInfo',field: 'ownerID'}},
        ]
    }

        title={'Lease List'} /> 
}

export default LeaseList;