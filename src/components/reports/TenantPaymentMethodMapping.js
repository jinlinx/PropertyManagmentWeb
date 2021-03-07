
import React, { useState, useEffect } from 'react';
import { getTenantPaymentMethodMapping } from '../aapi';
export default function TenantPaymentMethodMapping() {
    const [tenantPaymentMapping, setTenantPaymentMapping]=useState([]);
    useEffect(() => {
        getTenantPaymentMethodMapping().then(res => {
            setTenantPaymentMapping(res);
        })
    }, []);
    return <table>
        {
            tenantPaymentMapping.map(t => {
                //ptm.name, ptm.source , ti.firstName , ti.lastName
                return <tr><td>{t.name}</td><td>{t.source}</td><td>{ t.firstName+' ' + t.lastName}</td></tr>
            })
        }
    </table>

}