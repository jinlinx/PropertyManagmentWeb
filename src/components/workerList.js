import React from 'react';
import GenList from './GenList';

function WorkerList(props) {
    return <GenList 
    {...props}
    table={'workerInfo'} displayFields={[
        {field: 'firstName',desc: 'First Nameee'},
        'lastName','phone','email',
        {field:'created', desc:'Created'},{field:'modified',desc:'Modified'}
    ]} title={'Worker List'} />
}

export default WorkerList;