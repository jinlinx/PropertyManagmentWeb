import React  from 'react';
import GenList from './GenList';

function TenantList(props) {   
    return <GenList 
    {...props}
    table={'tenantInfo'} displayFields={[
        { field: 'firstName', desc:'First Nameee' }, 'lastName', 'ssn', 'phone', 'email'
    ]} title={'Tenant List'} /> 
}

export default TenantList;