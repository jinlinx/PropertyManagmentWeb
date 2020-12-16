
const { 
    parseCsv,
} = require('../src/components/utils');
const Promise = require('bluebird');
const { sqlFreeForm } = require('../testdist/api.js');
const uuid = require('uuid');

const str = require('fs').readFileSync('./x.csv').toString();
const rentData = parseCsv(str).slice(1);
const result = rentData.reduce((acc, r) => {
    const last = acc.last;
    [0, 1,2,3,8,9,10,11].forEach(i => r[i] && (last[i] = r[i]));
    const val = ['addr', 'unit', 'rent', 'lease', 'name', 'phone', 'email', 'comments','city','state','zip','owner'].reduce((acc, name, i) => {
        acc[name] = r[i] || last[i] || '';
        return acc;
    }, {});
    if (val.name) acc.res.push(val);
    return acc;
}, {
        res: [],
        last: [],
});


Promise.map(result.res, async data => {
    //console.log(data);
    const owner = await sqlFreeForm(`select ownerID from ownerInfo where ownerName=?`, [data.owner]);
    let ownerID;
    if (!owner[0]) {
        ownerID = uuid.v1();
        await sqlFreeForm(`insert into ownerInfo(ownerID,ownerName,shortName,created,modified)
        values(?,?,?,now(),now())`, [ownerID, data.owner, data.owner]);
    } else {
        ownerID = owner[0].ownerID;
    }
    const r = await sqlFreeForm(`select houseID from houseInfo where Address = ?`, [data.addr]).catch(err => {
        console.log(err)
    });
    let houseID = null;
    if (!r[0]) {
        houseID = uuid.v1();
        await sqlFreeForm(`insert into houseInfo (houseID,address,city,state, zip,ownerID, created,modified)
        values(?,?,?,?,?,?,now(),now())`, [houseID, data.addr, data.city, data.state, data.zip, ownerID]).catch(err => {
            console.log(err.response.body)
        })
    } else {
        houseID = r[0].houseID;
    }
    let leaseID = null;
    const lease = await sqlFreeForm(`select leaseID from leaseInfo where houseID=? and endDate>now()`, [houseID]);
    if (lease[0]) {
        leaseID = lease[0].leaseID;
    } else {
        leaseID = uuid.v1();
        await sqlFreeForm(`insert into leaseInfo (leaseID, houseID, startDate, endDate, comment, created, modified)
        values (?,?,now(), now()+ interval 365 day,?,now(),now())`,[leaseID, houseID, data.rent])
    }

    const names = data.name.split(' ');
    const { firstName, lastName } = names.reduce((acc, n) => {
        const name = n.trim();
        if (name) {
            if (!acc.firstName)
                acc.firstName = name;
            else
                acc.lastName = name;
        }
        return acc;
    }, { firstName: '', lastName:''});
    const tenant = await sqlFreeForm(`select tenantID from tenantInfo where firstName=? and lastName=?`, [firstName, lastName]);
    let tenantID = null;
    if (!tenant[0]) {
        tenantID = uuid.v1();
        await sqlFreeForm(`insert into tenantInfo( tenantID,firstName, lastName, email, phone, created, modified)
        values(?,?,?,?,?,now(),now())`, [tenantID, firstName, lastName,
            data.email, data.phone,            
        ]);
    } else {
        tenantID = tenant[0].tenantID;
    }
    const leaseTen = await sqlFreeForm(`select leaseID from leaseTenantInfo where leaseID=? and tenantId=?`, [leaseID, tenantID]);
    if (!leaseTen.length) {
        await sqlFreeForm(`insert into leaseTenantInfo(leaseID,tenantId) values(?,?)`, [leaseID, tenantID]);
    }
    console.log(`lease id ${leaseID} ${houseID} ${firstName} ${lastName} ${data.email ||''}`);
}, { concurrency: 1 }).catch(err => {
    console.log(err);
});
