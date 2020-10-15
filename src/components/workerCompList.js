import React from 'react';
import GenList from './GenList';
import { getData } from './api';

function WorkerCompList(props) {
    return <GenList 
    {...props}
    table={'workerComp'}
        customFields={{
            type: 'custom_select',
            schedule: 'custom_select',
        }}
        customSelData={
            {
                type: [
                    {value: 'percent', label: 'By Percent'},
                    {value: 'amount', label: 'Fixed Amount'},
                ],
                schedule: [
                    {value: 'monthly', label: 'At begining of month'},
                    {value: 'weekly', label: 'Weekly'},
                ]
            }
        }

        processForeignKey={
            ( fk, datas ) => {
                if ( fk.table==='leaseInfo'&&fk.field==='leaseID' ) {
                    return datas.map( data => {
                        return {
                            value: data[ fk.field ],
                            label: data[ 'comment' ],
                        }
                    } );
                } else if ( fk.table==='workerInfo'&&fk.field==='workerID' ) {
                    return datas.map( data => {
                        return {
                            value: data[ fk.field ],
                            label: data[ 'firstName' ]+' '+data[ 'lastName' ],
                        }
                    } );
                }
            }
        }
        displayFields={
            //actualy don't need to do this
            [                
                //{field: 'id', desc: 'ID', },
                {field: 'type', desc: 'Type', },
                {field: 'schedule', desc: 'Schedule', },
                {field: 'amount', desc: 'Amount', },
                {field: 'leaseComment', desc: 'Lease', },
                { field: 'workerFirstName', desc: 'Worker', dspFunc: (v, row) => `${v} ${row['workerLastName']}` },
                //{field: 'ownerID',desc: 'Owner ID',require: true,foreignKey: {table: 'ownerInfo',field: 'ownerID'}},
            ]
        }

        title={'Worker Comp List'} />
}

function WorkerCompListTop(props) {
    return <div>
        <div><button onClick={() => getData('calc/calc')}>Calc</button>
            <button onClick={() => getData('calc/settle')}>Settle</button>
        </div>
        <WorkerCompList {...props} />
    </div>
}

export default WorkerCompListTop;