import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup } from 'react-bootstrap';
import { sqlGetTableInfo, sqlGetTables, sqlFreeForm } from '../api';
import {v1} from 'uuid';
import moment from 'moment';
import Promise from 'bluebird';
import { TenantMatcher } from './TenantMatcher';
import { linkPayment } from '../aapi';

function PaymentMatch(props) {
    const [imported, setImported] = useState([]);
    const [importItem, setImportItem] = useState({});


    const [needCreateItem, setNeedCreateItem] = useState({});
    const [matchedTo, setMatchedTo] = useState({});
    const [createTenantItem, setCreateTenantItem] = useState({});

    useEffect(() => {
        sqlFreeForm(`select ip.id, ip.name, ip.date, ip.amount, ip.source, ip.notes , ptm.tenantID, t.firstName, t.lastName, lti.leaseID
        from importPayments ip
        left join payerTenantMapping ptm on ip.source=ptm.source and ip.name=ptm.name
        left join tenantInfo t on t.tenantID = ptm.tenantID
        left join  leaseTenantInfo lti on t.tenantID = lti.tenantID
        where ip.matchedTo is null and ip.deleted is null`).then(async r => {
            setImported(r.map(r => {
                return {
                    ...r,
                    itemId: r.id,
                }
            }));
            setImportItem(r.reduce((acc, rr) => { 
                if (rr.leaseID) acc[rr.id] = true;
                return acc;
            }, {}))
        });
    },[]);
    const idToItemMap = imported.reduce((acc,ci)=>{
        acc[ci.itemId] = ci;
        return acc;
    },{});
    return <>
        <TenantMatcher context={{
            onClose: () => setCreateTenantItem({}),
            name: createTenantItem.name,
            source: createTenantItem.source,
            tenantID: createTenantItem.tenantID,
            imported, setImported,
            addTenantIdToItem: tenantID => setCreateTenantItem({
                ...createTenantItem,
                tenantID,
            })
        } }></TenantMatcher>
        <Table>
        <thead><tr>
            <td>Date</td><td>Name</td><td>Amount</td><td>Note</td><td>Source</td><td>Action</td><td>                        
                    <Button onClick={async () => {
                        await Promise.map(imported, async imp => {
                            const canImport = importItem[imp.itemId];                            
                            if (canImport && imp.leaseID && !imp.matchedTo) {
                                const id = v1();                                
                                console.log(`importing ${imp.date} ${imp.amount} ${imp.name} leaseid=${imp.leaseID} ${imp.notes}`)
                                setImported(prev => prev.map(p => {
                                    if (p.id === imp.id) {
                                        return {
                                            ...imp,
                                            matchedTo: id,
                                        }
                                    }
                                    return p;
                                }));
                                await linkPayment(id, imp);
                            }
                        }, { concurrency: 1 });
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
                                                 const itemId = itm.itemId;
                                                 const checked = e.target.checked;
                                                 console.log(`val=${itemId} ${checked}`);
                                                 if (checked) {
                                                     const existing = itm.leaseID; //get(tnts, '0.tenantID');
                                                     if (!existing) {
                                                         setCreateTenantItem(itm);
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
                            itm.tenantID && <DropdownButton title={`${itm.firstName} - ${itm.lastName}`} >
                                <Dropdown.Item >{itm.name}</Dropdown.Item>
                            </DropdownButton>
                        }
                    </td>
                    <td>
                        <Button onClick={() => {
                            sqlFreeForm(`update importPayments set deleted='1' where id=? `, [itm.id]).then(() => {
                                setImported(imported.filter(r => r.id !== itm.id)); 
                            });
                        }}>Delete</Button>
                    </td>
                </tr> 
            })
            }
        </tbody>
        </Table>
        </>
}


export default PaymentMatch;