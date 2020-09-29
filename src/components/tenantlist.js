import React, {useState, useEffect} from 'react';
import { getData, getModel, sqlGet, sqlAdd, sqlDelete } from './api';
import GenCrud from './GenCrud';
import mod from './models';

function TenantList() {
    // [
    //     { field: 'tenantID', desc: 'Id', type: 'uuid', required: true, isId: true },
    //     { field: 'firstName', desc: 'First Name', required: true },
    //     { field: 'lastName', desc: 'Last Name', require: true },
    //     { field: 'email', desc: 'Email', },
    //     { field: 'phone', desc: 'Phone', },
    //     { field: 'ssn', desc: 'SSN', },
    //     { field: 'driverID', desc: 'Driver License', },
    //     { field: 'driverIDState', desc: 'State', },
    //     { field: 'momName', desc: 'Mother', },
    //     { field: 'momPhone', desc: 'Mom\'s phone number', },
    //     { field: 'dadName', desc: 'Dad Name', },
    //     { field: 'dadPhone', desc: 'Dad Phone', },
    // ];
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [columnInf, setColumnInf] = useState([]);
    const reload = () => {
        sqlGet('tenantInfo', columnInf.map(f=>f.field)).then(res => {
            setTenants(res);
            setLoading(false);
        });
    }
    

    useEffect(() => {
        const ld = async ()=>{
            if (!mod.models.tenantInfo) {
                mod.models.tenantInfo = await getModel('tenantInfo');
            }
            console.log(mod);
            setColumnInf(mod.models.tenantInfo.fields);
            reload();
        }
        ld();
    }, []);

    const doAdd = (data,id) => {
        //const sql = `insert into tenantInfo (${columnInf.map(c => `\`${c.field}\``).join(',')}) values (${columnInf.map(f => data[f.field] || '').map(v => `'${v}'`).join(',')
        //    })`;
        const submitData = columnInf.reduce((acc, f) => {
            acc[f.field] = data[f.field];
            return acc;
        }, {});
        sqlAdd('tenantInfo',submitData, !id).then(() => {
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
        sqlDelete('tenantInfo', id).then(() => {
            reload();
        })
    }
    return <div>
        <p class='subHeader'>List of Tenants</p>
        {
            (loading || !columnInf) ? <p>Loading</p> :
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