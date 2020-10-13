import React  from 'react';
import GenList from './GenList';

function OwnerList(props) {   
    return <GenList {...props} table={'ownerInfo'} title={'Owner List'}/> 
}

export default OwnerList;