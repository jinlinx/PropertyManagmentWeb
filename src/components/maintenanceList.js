import moment from 'moment';
import React, {useEffect} from 'react';
import GenList from './GenList';
import { fmtDate } from './util';
function MaintenanceList(props) {
    const tableName = 'maintenanceRecords';
    useEffect(() => {
        const pageState = props?.pageState;
        pageState.setPageProps(state => ({
            ...state,
            [tableName]: {
                sorts: [
                    {
                        name: 'date',
                        op: 'desc',
                        shortDesc: 'DS',
                    },
                    {
                        name: 'address',
                        op: 'asc',
                        shortDesc: 'AS',
                    }
                ]
            }
        }));
    }, []);
    const ignoreNull = x => x === null ? '' : x;
    //const {pageProps, setPageProps} = props.pageState;
    return <GenList table={tableName}
    {...props}
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
    treatData = {
        {
            date: (name, row)=>{
                return fmtDate(row[name]);
            }
        }
    }
    displayFields={
            //actualy don't need to do this
            [
                /*{field: 'houseID',desc: 'Id',type: 'uuid',required: true,isId: true},*/
            { field: 'workerID', desc: 'Worker', dspFunc: (name, row) => `${ignoreNull(row['workerFirstName'])} ${ignoreNull(row['workerLastName'])}`},
                {field: 'address',desc: 'Address',required: true},
                {field: 'date',desc: 'date', dspFunc: fmtDate},
                {field: 'amount',desc: 'Amount',},
            { field: 'comment', desc: 'Comment', },
                //{field: 'ownerID',desc: 'Owner ID',require: true,foreignKey: {table: 'ownerInfo',field: 'ownerID'}},
            ]
        }        
        title={'Maintance List'}
    /> 
}

export default MaintenanceList;