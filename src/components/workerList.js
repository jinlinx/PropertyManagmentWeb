import React from 'react';
import GenList from './GenList';
import moment from 'moment';
function WorkerList(props) {
    return <GenList 
    {...props}
    table={'workerInfo'} displayFields={[
        {field: 'firstName',desc: 'First Nameee'},
        'lastName','phone','email', 'address',
        {
            field: 'createdBy', desc: 'CreatedBy',
            dspFunc: (date) => {
                return moment(date).format('YYYY-MM-DD HH:mm:ss')
            }
        },
        { field: 'modified', desc: 'Modified' }
    ]} title={'Worker List'} />
}

export default WorkerList;