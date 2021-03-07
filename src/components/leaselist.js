import React  from 'react';
import GenList from './GenList';
import {fmtDate} from './util';
import LeaseEmail from './leaseEmail/leaseEmail';
const { parseCsv } = require('./utils');
function LeaseList(props) {
    //<LeaseEmail/>
    /*
     <input type='file' onChange={e => {
            const file = e.target.files[0];
            console.log(file);
            var reader = new FileReader();
            reader.onload = function (e) {
                // Use reader.result
                console.log(parseCsv(reader.result.toString()));
            }
            reader.readAsText(file);
        }}></input>  
    */
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
        { field: 'shortName', desc: 'Owner' },
            //{field: 'ownerID',desc: 'Owner ID',require: true,foreignKey: {table: 'ownerInfo',field: 'ownerID'}},
        ]
    }
        processForeignKey={
            (fk, datas) => {
                return datas.map(data => {
                    return {
                        value: data[fk.field],
                        label: data['address']
                    }
                })
            }
        }
        title={'Lease List'} />
}

export default LeaseList;