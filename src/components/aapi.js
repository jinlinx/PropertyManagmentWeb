import { sqlFreeForm, doPostOp, sqlGet } from './api';
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
export async function linkPayments(data) {
    return doPostOp('misc/matchPayments', data);
}

export async function getImportablePayments() {
    return sqlFreeForm(`select ip.id, ip.name, ip.date, ip.amount, ip.source, ip.notes , ptm.tenantID, t.firstName, t.lastName, lti.leaseID
        from importPayments ip
        left join payerTenantMapping ptm on ip.source=ptm.source and ip.name=ptm.name
        left join tenantInfo t on t.tenantID = ptm.tenantID
        left join  leaseTenantInfo lti on t.tenantID = lti.tenantID
        where ip.matchedTo is null and ip.deleted is null
        order by ip.date desc`);
}

export async function getImportLogs() {
    return sqlFreeForm(`select start,end,source,msg from importLog order by start desc limit 10`);
}

export async function getOwners() {
    return sqlFreeForm(`select * from ownerInfo`);
}

export async function getMaintenanceReport(ownerInfo) {
    if (!ownerInfo) return [];
    return sqlGet({
        fields:['month', {op:'sum', field:'amount', name:'amount'},'expenseCategoryName','displayOrder'],
        table:'maintenanceRecords',
        whereArray:[{
            field:'ownerID',
            op: '=',
            val: ownerInfo.ownerID || ''
        }],
        groupByArray:[{field:'month'},{field:'expenseCategoryID'},{field:'displayOrder'}]
    }).then(r=>{
        return r.rows.map(r=>{
            return {
                ...r,
                category: r.expenseCategoryName,
            }
        });
    });
    return sqlFreeForm(`select month, sum(amount) amount,  expenseCategoryName category, e.displayOrder 
    from maintenanceRecords m inner join expenseCategories e on m.expenseCategoryID=e.expenseCategoryID 
    group by m.month,
    e.expenseCategoryID ,e.displayOrder 
    order by month, e.displayOrder,expenseCategoryName`);
}

// Used by cashflow
export async function getPaymnents(ownerInfo) {
    if (!ownerInfo) return [];
    return sqlGet({
        table:'rentPaymentInfo',
        whereArray:[{
            field:'ownerID',
            op: '=',
            val: ownerInfo.ownerID || ''
        }]
    }).then(r=>{
        return r.rows.map(r=>{
            return {
                ...r,
                date: r.receivedDate,
                amount: r.receivedAmount,
            }
        });
    })
    return sqlFreeForm(` select rp.receivedAmount amount, rp.receivedDate date, rp.paidBy, rp.notes, h.address, h.houseID addressId,
    oi.shortName ownerName,
    ip.source
     from rentPaymentInfo rp inner join leaseInfo l on l.leaseID=rp.leaseID
     inner join houseInfo h on h.houseID=l.houseID
     inner join ownerInfo oi on oi.ownerID  = h.ownerID 
left join importPayments ip  on ip.paymentID  = rp.paymentID 
     order by rp.receivedDate;`);
}

export async function getPaymentSubTotalInfo() {
    return sqlFreeForm(`
    select month(rpi.receivedDate)  paymentMonth, Year(rpi.receivedDate)  paymentYear, sum(receivedAmount) amount,  hi.address  
    from rentPaymentInfo rpi inner join leaseInfo li  on rpi.leaseID = li.leaseID
    inner join houseInfo hi on hi.houseID = li.houseID 
    group by paymentMonth,paymentYear, hi.address
    order by paymentMonth,paymentYear, hi.address
    `); 
}

export async function getTenantPaymentMethodMapping() {
    return sqlFreeForm(`select ptm.name, ptm.source , ti.firstName , ti.lastName , ti.tenantID
    from payerTenantMapping ptm inner join tenantInfo ti on ti.tenantID  = ptm.tenantID `);
}