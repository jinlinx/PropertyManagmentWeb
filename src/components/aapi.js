import { sqlFreeForm } from './api';
import { get } from 'lodash';

export async function checkTenantProcessorPayee({ source, name }) {
    const tnts = await sqlFreeForm(`select tn.tenantID 
                                                     from tenantInfo tn
                                                     inner join payerTenantMapping ptn on tn.tenantID = ptn.tenantID
                                                      where ptn.name=? and ptn.source=?`,
        [name, source]);
    const existing = get(tnts, '0.tenantID');
    return existing;
}


export async function saveTenantProcessorPayeeMapping({ source, name, tenantID }) {
    const parms = [tenantID, name, source];
    const exists = await sqlFreeForm(`select 1 from payerTenantMapping where tenantID=? and name=? and source=?`, parms);
    if (exists.length) return;
    await sqlFreeForm(`insert into payerTenantMapping(tenantID, name, source) values(?,?,?)`,parms);
}