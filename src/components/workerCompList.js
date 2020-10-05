import React from 'react';
import GenList from './GenList';
import {fmtDate} from './util';

function WorkerCompList() {
    return <GenList table={'workerComp'}
        customFields={{
            type: 'custom_select',
            schedule: 'custom_select',
        }}
        customSelData={
            {
                type: [
                    {name: 'percent', label: 'By Percent'},
                    {name: 'amount', label: 'Fixed Amount'},
                ],
                schedule: [
                    {name: 'monthly', label: 'At begining of month'},
                    {name: 'weekly', label: 'Weekly'},
                ]
            }
        }
        fieldFormatter={
            ( val, fieldName ) => {
                if ( fieldName==='created'||fieldName==='modified' ) {
                    return fmtDate( val );
                }
                return val;
            }
        }
        processForeignKey={
            ( fk, datas ) => {
                return datas.map( data => {
                    return {
                        value: data[ fk.field ],
                        label: data[ 'comment' ],
                    }
                } )
            }
        }
        displayFields={
            //actualy don't need to do this
            [
                {field: 'id', desc: 'ID', },
                {field: 'amount', desc: 'Amount', },
                {field: 'leaseComment', desc: 'Lease', },
                {field: 'workerFirstName', desc: 'Worker', },
                {field: 'workerLastName', desc: 'Worker', },
                //{field: 'ownerID',desc: 'Owner ID',require: true,foreignKey: {table: 'ownerInfo',field: 'ownerID'}},
            ]
        }
        loadMapper={
            ( type, fields ) => {
                if ( type==='fields' ) {
                    return fields;
                }
                if ( type==='joins' ) {
                    return {
                        'leaseInfo': {
                            leaseID: 'leaseID',
                            comment: 'leaseComment',
                        },
                        workerInfo: {
                            email: 'workerEmail',
                            firstName: 'workerFirstName',
                            lastName: 'workerLastName',
                        }
                    }
                }
            }
        }
        title={'Worker Comp List'} />
}

export default WorkerCompList;