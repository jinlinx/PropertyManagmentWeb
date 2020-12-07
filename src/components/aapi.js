import { sqlFreeForm } from './api';
export async function checkTenantProcessorPayee({ source, name }) {
    const tnts = await sqlFreeForm(`select tn.tenantID 
                                                     from tenantInfo tn
                                                     inner join payerTenantMapping ptn on tn.tenantID = ptn.tenantID
                                                      where ptn.name=? and ptn.source=?`,
        [itm.name, itm.source]);
    const existing = get(tnts, '0.tenantID');
    return existing;
}