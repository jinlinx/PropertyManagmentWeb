import { sqlFreeForm } from './api';
import { get } from 'lodash';
import moment from 'moment';

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

export async function getTenants(firstName, lastName) {
    const res = await sqlFreeForm(`select tenantID, firstName, lastName from tenantInfo 
        where firstName like ? or lastName like ?`, [`%${firstName}%`, `%${lastName}%`]);
    return res;
}
export async function getHouses(address) {
    const houses = await sqlFreeForm(`select houseID,address,city,state
                                                     from houseInfo                                                     
                                                      where address like ?`,
        [`%${address}%`]);
    return houses;
}

export async function getLeases(houseID, leaseComment='') {
    const leases = await sqlFreeForm(`select leaseID, deposit, endDate, startDate, houseID, comment, monthlyRent
                                                     from leaseInfo                                                     
                                                      where houseID =? and comment like ?`,
        [houseID, `%${leaseComment}%`]);
    return leases;
}

export async function getLeaseByTenant(tenantID) {
    const leaseTenants = await sqlFreeForm(`select l.leaseID, l.deposit, l.endDate, l.startDate, h.houseID, l.comment, l.monthlyRent,
        h.address, h.city, h.state
                                                     from leaseInfo l
                                                     inner join houseInfo h on l.houseID=h.houseID
                                                     inner join leaseTenantInfo lt on lt.leaseID = l.leaseID                                                     
                                                      where lt.tenantID=? `, [tenantID]);
    return leaseTenants;
}

export async function createLeaseTenantLink(leaseID, tenantID) {
    const parms = [leaseID, tenantID];
    const existing = await sqlFreeForm(`select 1 from leaseTenantInfo where leaseID=? and tenantId=?`, parms);
    if (!existing.length) {
        await sqlFreeForm(`insert into leaseTenantInfo( leaseID,tenantId, id) values(?,?, uuid())`, parms);
    }
}

export async function deletePaymentImport(id) {
    sqlFreeForm(`update importPayments set deleted='1' where id=? `, [id])
}
export async function linkPayment(id, imp) {
    await sqlFreeForm(`insert into rentPaymentInfo(paymentID, receivedDate,receivedAmount,
                        paidBy,leaseID,created,modified,notes)
                        values(?,?,?,
                        ?,?,now(),now(),?)`, [id, moment(imp.date).format('YYYY-MM-DD'), imp.amount,
        imp.name, imp.leaseID, imp.notes]);
    return await sqlFreeForm(`update importPayments set matchedTo=? where id=?`, [id, imp.id]);
}

export async function getImportablePayments() {
    return sqlFreeForm(`select ip.id, ip.name, ip.date, ip.amount, ip.source, ip.notes , ptm.tenantID, t.firstName, t.lastName, lti.leaseID
        from importPayments ip
        left join payerTenantMapping ptm on ip.source=ptm.source and ip.name=ptm.name
        left join tenantInfo t on t.tenantID = ptm.tenantID
        left join  leaseTenantInfo lti on t.tenantID = lti.tenantID
        where ip.matchedTo is null and ip.deleted is null`);
}