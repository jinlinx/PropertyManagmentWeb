import React from 'react';
import GenList from './GenList';

function WorkerList() {
    return <GenList table={'workerInfo'} displayFields={[
        {field: 'firstName',desc: 'First Nameee'},
        'lastName','phone','email',
        {field:'created', desc:'Created'},{field:'modified',desc:'Modified'}
    ]} title={'Worker List'} />
}

export default WorkerList;