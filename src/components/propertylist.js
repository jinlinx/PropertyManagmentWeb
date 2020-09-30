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
        title={'Property List'}
    /> 
}

export default HouseList;