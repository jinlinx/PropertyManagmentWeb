import React from 'react';
import GenList from './GenList';

function MaintenanceList(props) {   
    //const {pageProps, setPageProps} = props.pageState;
    return <GenList table={'maintenanceRecords'}
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
    displayFields={
            //actualy don't need to do this
            [
                /*{field: 'houseID',desc: 'Id',type: 'uuid',required: true,isId: true},*/
                {field:'workerID', desc:'Worker', dspFunc:(name,row)=>`${row['workerFirstName']} ${row['workerLastName']}`},
                {field: 'address',desc: 'Address',required: true},
                {field: 'date',desc: 'date',},
                {field: 'amount',desc: 'Amount',},
            { field: 'comment', desc: 'Comment', },
                //{field: 'ownerID',desc: 'Owner ID',require: true,foreignKey: {table: 'ownerInfo',field: 'ownerID'}},
            ]
        }        
        title={'Maintance List'}
    /> 
}

export default MaintenanceList;