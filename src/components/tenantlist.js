import React, {useState, useEffect} from 'react';
import { getData } from './api';
import GenCrud from './GenCrud';

function TenantList() {
    const columnInf = [
        { field: 'tenantID', desc: 'Id', type: 'uuid', required: true, isId: true },
        { field: 'firstName', desc: 'First Name', required: true },
        { field: 'lastName', desc: 'Last Name', require: true },
        { field: 'email', desc: 'Email', },
        { field: 'phone', desc: 'Phone', },
        { field: 'ssn', desc: 'SSN', },
        { field: 'driverID', desc: 'Driver License', },
        { field: 'driverIDState', desc: 'State', },
        { field: 'momName', desc: 'Mother', },
        { field: 'momPhone', desc: 'Mom\'s phone number', },
        { field: 'dadName', desc: 'Dad Name', },
        { field: 'dadPhone', desc: 'Dad Phone', },
    ];
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const reload = () => {
        getData('select * from tenantInfo').then(res => {
            setTenants(res);
            setLoading(false);
        });
    }
    

    useEffect(() => {
        reload();
    }, []);

    const doAdd = data => {
        const sql = `insert into tenantInfo (${columnInf.map(c => `\`${c.field}\``).join(',')}) values (${columnInf.map(f => data[f.field] || '').map(v => `'${v}'`).join(',')
            })`;
        getData(sql).then(() => {
            setLoading(true);
            console.log('reloading');
            reload();
        }).catch(err => {
            setLoading(false);
            console.log(err);
        });
    }

    const doDelete = (name,id) => {
        setLoading(true);
        getData(`delete from tenantInfo where ${name}='${id}'`).then(() => {
            reload();
        });
    }
    return <div>
        <p class='subHeader'>List of Tenantsaaaaa</p>
        {
            loading ? <p>Loading</p> :
                <div>
                    <GenCrud
                        displayFields={['tenantID', 'firstName', 'lastName']}
                        columnInfo={
                            columnInf
                        }
                        doAdd={doAdd}
                        doDelete = {doDelete}
                        rows={tenants}
                    ></GenCrud>
                </div>
        }
    </div>
}

export default TenantList;