import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup } from 'react-bootstrap';
import { sqlGetTableInfo, sqlGetTables, sqlFreeForm } from '../api';
import { nameToFirstLast } from '../util'
import { get } from 'lodash';
import {v1} from 'uuid';
import moment from 'moment';
import Promise from 'bluebird';
import { TenantMatcher } from './TenantMatcher';

function PaymentMatch(props) {
    const [imported, setImported] = useState([]);
    const [importItem, setImportItem] = useState({});
    const [needCreateItem, setNeedCreateItem] = useState({});
    const [matchedTo, setMatchedTo] = useState({});
    const [matchedToName, setMatchedToName] = useState('');
    const getItemId = i => {
        return `${i.date}-${i.name}-${i.amount}-${i.notes}-${i.source}`;
    }
    useEffect(() => {
        sqlFreeForm(`select name, date, amount, source, notes from importPayments where matchedTo is null`).then(r => {
            setImported(r.map(r => {
                return {
                    ...r,
                    itemId: getItemId(r),
                }
            }));
        })
    },[]);
    const idToItemMap = imported.reduce((acc,ci)=>{
        acc[ci.itemId] = ci;
        return acc;
    },{});
    return <>
        <TenantMatcher context={{
            onClose: () => setMatchedToName(''),
            name: matchedToName,
        } }></TenantMatcher>
        <Table>
        <thead><tr>
            <td>Date</td><td>Name</td><td>Amount</td><td>Note</td><td>Source</td><td>Action</td><td>                        
                    <Button onClick={async () => {
                        return;
                await Promise.map(imported, async imp=>{
                    const matched = matchedTo[imp.itemId];
                    if (!imp.matchedTo && matched) {
                        const id = v1();
                        await sqlFreeForm(`insert into rentPaymentInfo(paymentID, receivedDate,receivedAmount,
                        paidBy,leaseID,created,modified,notes)
                        values(?,?,?,
                        ?,?,now(),now(),?)`,[id, moment(imp.date).format('YYYY-MM-DD'), imp.amount,
                        imp.name, matched.id, imp.notes]);
                        imp.matchedTo = id;
                        setImported(prev=>[...prev]);
                    }
                }, {concurrency: 1});
            }}>Map</Button>
            </td></tr></thead>
        <tbody>
        {
            imported.map((itm, ind) => {
                return <tr key={ind}><td>{itm.date.slice(0, 10)}</td><td>{itm.name}</td><td>{itm.amount}</td><td>{itm.notes}</td><td>{itm.source}</td>
                    <td>
                        {!itm.matchedTo &&
                        <InputGroup.Checkbox aria-label="Select for import" checked={importItem[itm.itemId] || false}
                            onChange={async e => {
                                setMatchedToName(itm.name);
                                                 const itemId = itm.itemId;
                                                 const checked = e.target.checked;
                                                 console.log(`val=${itemId} ${checked}`);
                                                 if (checked) {
                                                     //const {firstName, lastName} = nameToFirstLast(itm.name);
                                                     const tnts = await sqlFreeForm(`select tn.tenantID 
                                                     from tenantInfo tn
                                                     inner join payerTenantMapping ptn on tn.tenantID = ptn.tenantID
                                                      where ptn.name=? and ptn.source=?`,
                                                         [itm.name, itm.source]);
                                                     const existing = get(tnts, '0.tenantID');
                                                     if (!existing) {
                                                         setNeedCreateItem({
                                                             ...needCreateItem,
                                                             [itemId]: true,
                                                         })
                                                     } else {
                                                         const allMatches = imported.reduce((acc, ci) => {
                                                             if (ci.name === itm.name) {
                                                                 acc[ci.itemId] = {
                                                                     name: itm.name,
                                                                     id: existing,
                                                                 }
                                                             }
                                                             return acc;
                                                         }, {});
                                                         setMatchedTo({
                                                             ...matchedTo,
                                                             [itm.itemId]: {
                                                                 name: itm.name,
                                                                 id: existing,
                                                             },
                                                             ...allMatches
                                                         })
                                                     }
                                                 } else {
                                                     setNeedCreateItem({
                                                         ...needCreateItem,
                                                         [itemId]: false,
                                                     })
                                                 }
                                                 const importItemsCheck = imported.reduce((acc, ci) => {
                                                         if (checked && idToItemMap[ci.itemId].name === idToItemMap[itemId].name) {
                                                             if (acc[ci.itemId] !== false) {
                                                                 acc[ci.itemId] = true;
                                                             }
                                                         }
                                                         return acc;
                                                     },
                                                     {
                                                         ...importItem,
                                                         [itemId]: checked,
                                                     });
                                                 setImportItem(importItemsCheck);
                                             }}/>
                        }
                    </td>
                    <td>
                        {
                            needCreateItem[itm.itemId] && <Button onClick={async () => {
                                const { firstName, lastName } = nameToFirstLast(itm.name);
                                const existingTenant = await sqlFreeForm(`select tenantID from tenantInfo 
                                where firstName=? and lastName=?`, [firstName, lastName]);
                                const existingTenantId = get(existingTenant, '0.tenantID');
                                const tenantID = existingTenantId|| v1();
                                await sqlFreeForm(`insert into tenantInfo( tenantID,firstName, lastName, email, phone, created, modified)
        values(?,?,?,?,?,now(),now())`, [tenantID, firstName, lastName,
                                    'no email', 'no phone',
                                ]);

                                await sqlFreeForm(`insert into payerTenantMapping( tenantID, name, source, created, modified)
        values(?,?,?,now(),now())`, [tenantID, itm.name, itm.source]);
                                
                                const houseID = v1();
                                await sqlFreeForm(`insert into houseInfo (houseID,address,city,state, zip,ownerID, created,modified)
        values(?,?,?,?,?,?,now(),now())`, [houseID, `House Created for ${itm.name}`, 'no city', 'na', 'nozip', null]).catch(err => {
                                    console.log(err.response.body)
                                })
                            
                                const leaseID = v1();
                                await sqlFreeForm(`insert into leaseInfo (leaseID, houseID, startDate, endDate, comment, created, modified)
        values (?,?,now(), now()+ interval 365 day,?,now(),now())`, [leaseID, houseID, `created for ${itm.name}`])
    
                                
                                await sqlFreeForm(`insert into leaseTeantsInfo(leaseID,tenantId) values(?,?)`, [leaseID, tenantID]);
                                setNeedCreateItem({
                                    ...needCreateItem,
                                    [itm.itemId]: false,
                                })
                                
                            }}>Create Lease</Button>
                        }
                        {
                            matchedTo[itm.itemId] && <DropdownButton title={matchedTo[itm.itemId].name} >
                                <Dropdown.Item >{matchedTo[itm.itemId].name}</Dropdown.Item>
                            </DropdownButton>
                        }
                    </td>
                </tr> 
            })
            }
        </tbody>
        </Table>
        </>
}


export default PaymentMatch;