import React, {useState, useEffect} from 'react';
import { getData } from './api';


function TenantList() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getData('TenantInfo').then(res => {
            setTenants(res);
            setLoading(false);
        });
    }, []);
    return <div>
        <p class='subHeader'>List of Tenants</p> 
        {
            loading?<p>Loading</p>:
            <table class='listTable'>
                <tr>
                    <td class='listTblCell'>House</td>
                    <td class='listTblCell'>First Name</td>
                    <td class='listTblCell'>Last Name</td>
                    <td class='listTblCell'>Phone</td>
                    <td class='listTblCell'>Email</td>
                    <td class='listTblCell'>Comments</td>
                    <td class='listTblCell'></td>

                </tr>
                {
                    tenants.map((tenant, i) => {
                        return <tr id={i}>
                            <td class='listTblCell'>N/A</td>
                            <td class='listTblCell'>{tenant.FirstName}</td>
                            <td class='listTblCell'>{tenant.LastName}</td>
                            <td class='listTblCell'>{tenant.phone}</td>
                            <td class='listTblCell'>{tenant.email}</td>
                            <td class='listTblCell'></td>
                        </tr>;
                    })
                }


            </table>
        }
    </div>
}

export default TenantList;