import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup, Tab } from 'react-bootstrap';
import EmailTemplate from './emailTemplate';
const { sqlFreeForm } = require('../api');
export default function LeaseEmail() {
    const [leases, setLeases] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [selectedLease, setSelectedLease] = useState({});    
    const loadLeases = () => {
        sqlFreeForm(`select h.houseID, h.address, h.state, h.city, h.zip,
        l.leaseID, l.endDate, l.comment
        from houseInfo h inner join leaseInfo l on h.houseID=l.houseID
        where l.endDate > now()
        order by l.endDate desc`).then(res => {
            setLeases(res);
        })
    }
    useEffect(() => {
        loadLeases();
    }, []);
    const loadLeaseEmail = () => {
        return sqlFreeForm(`select email
        from leaseEmail where leaseID=?
        order by email`, [selectedLease.leaseID]).then(res => {
            setSelectedEmails(res.map(r => ({
                ...r,
                dbEmail: r.email,
            })));
        });
    }
    useEffect(() => {
        sqlFreeForm(`select t.tenantID, t.firstName, t.lastName, t.email, t.phone
        from leaseTeantsInfo lt inner join tenantInfo t on lt.tenantID=t.tenantID
        where lt.leaseID=?
        order by t.firstName`, [selectedLease.leaseID]).then(res => {
            setTenants(res);
        });
        loadLeaseEmail();
    }, [selectedLease.address]);
    const selectedEmailMap = selectedEmails.reduce((acc, email) => {
        acc[email.email.toLowerCase()] = true;
        return acc;
    }, {});
    const addEmail = email => {
        return sqlFreeForm(`insert into leaseEmail(leaseID,email) values(?,?)`, [selectedLease.leaseID, email])
            .then(loadLeaseEmail);
    }
    const deleteEmail = email => {
        return sqlFreeForm(`delete from leaseEmail where leaseID=? and email=?`, [selectedLease.leaseID, email]).then(loadLeaseEmail);
    }
    const updateEmail = (ent) => {
        return sqlFreeForm(`update leaseEmail set email=? where leaseID=? and email=?`, [ent.email, selectedLease.leaseID, ent.dbEmail]).then(loadLeaseEmail);
    }
    return <div>
        <DropdownButton title={selectedLease.address || ''} >
            {
                leases.map((l,ind) => {
                    return <Dropdown.Item key={ind} onSelect={() => setSelectedLease(l)}>{ l.address }</Dropdown.Item>            
                })
            }
        </DropdownButton>
        <EmailTemplate leaseID={selectedLease.leaseID} context={{
            selectedEmails, setSelectedEmails,
            loadLeaseEmail,
            addEmail,
            deleteEmail,
            updateEmail,
        }} />
        <Table>
            <tbody>
                <tr><td></td><td>firstName</td><td>Last Name</td><td>Email</td><td>Phone</td></tr>
                {
                    tenants.map((l,ind) => {
                        return <tr key={ind}><td>
                            {l.email && <InputGroup.Checkbox aria-label="Select for email" checked={selectedEmailMap[l.email.toLowerCase()] || false} onChange={e => {

                                console.log('val=' + e.target.checked);
                                if (e.target.checked) {
                                    const eml = l.email.toLowerCase();
                                    if (!selectedEmailMap[eml]) {
                                        //setSelectedEmails([...selectedEmails, eml]);
                                        addEmail(l.email);
                                    }
                                } else {
                                    //setSelectedEmails(selectedEmails.filter(e => e.toLowerCase() !== l.email.toLowerCase()));
                                    deleteEmail(l.email);
                                }
                            }} />
                            }
                        </td><td>{l.firstName}</td><td>{l.lastName}</td><td>{l.email}</td><td>{l.phone}</td></tr>
                    })
                }
            </tbody>
        </Table>
    </div>
}