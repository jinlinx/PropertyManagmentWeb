import React  from 'react';
import GenList from './GenList';

function TenantList() {   
    return <GenList table={'tenantInfo'} displayFields={['firstName','lastName','ssn','phone','email']} title={'Tenant List'}/> 
}

export default TenantList;