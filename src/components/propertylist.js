import React from 'react';
import GenList from './GenList';

function HouseList() {   
    return <GenList table={'houseInfo'}
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
        columnInfo={
            //actualy don't need to do this
            [
                {field: 'houseID',desc: 'Id',type: 'uuid',required: true,isId: true},
                {field: 'address',desc: 'Address',required: true},
                {field: 'city',desc: 'City',},
                {field: 'state',desc: 'State',},
                {field: 'zip',desc: 'Zip',},
                {field: 'ownerID',desc: 'Owner ID',require: true,foreignKey: {table: 'ownerInfo',field: 'ownerID'}},
            ]
        }
        loadMapper={
            (type,fields) => {
                if(type==='fields') {
                    return fields;
                }
                if(type==='joins') {
                    return {
                        'ownerInfo': {
                            ownerName: 'ownerName',
                            shortName:'ownerShort',
                        }
                    }
                }
            }
        }
        title={'Property List'}
    /> 
}

export default HouseList;