import React from 'react';
import GenList from './GenList';

function HouseList(props) {   
    //const {pageProps, setPageProps} = props.pageState;
    return <GenList table={'houseInfo'}
    {...props}
        processForeignKey={
            (fk, datas) => {
                return datas.map(data => {
                    return {
                        value: data[fk.field],
                        label: data['ownerName']
                }
            })
        }
    }
    displayFields={
            //actualy don't need to do this
            [
                {field: 'houseID',desc: 'Id',type: 'uuid',required: true,isId: true},
                {field: 'address',desc: 'Address',required: true},
                {field: 'city',desc: 'City',},
                {field: 'state',desc: 'State',},
            { field: 'zip', desc: 'Zip', },
            {field: 'ownerName',desc: 'Owner',},
                //{field: 'ownerID',desc: 'Owner ID',require: true,foreignKey: {table: 'ownerInfo',field: 'ownerID'}},
            ]
        }        
        title={'Property List'}
    /> 
}

export default HouseList;