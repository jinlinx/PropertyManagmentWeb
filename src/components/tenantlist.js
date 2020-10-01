import React  from 'react';
import GenList from './GenList';

function TenantList() {   
    return <GenList table={'tenantInfo'} displayFields={[
        { field: 'firstName', desc:'First Nameee' }, 'lastName', 'ssn', 'phone', 'email'
    ]} title={'Tenant List'} /> 
}

export default TenantList;