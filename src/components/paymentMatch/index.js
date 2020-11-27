import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup } from 'react-bootstrap';
import { sqlGetTableInfo, sqlGetTables, sqlFreeForm } from '../api';
import { nameToFirstLast } from '../util'
import { get } from 'lodash';
import {v1} from 'uuid';
function PaymentMatch(props) {
    const [imported, setImported] = useState([]);
    const [importItem, setImportItem] = useState({});
    const [needCreateItem, setNeedCreateItem] = useState({});
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
    });    
    return <Table>
        {
            imported.map((itm, ind) => {
                return <tr key={ind}><td>{itm.date.slice(0, 10)}</td><td>{itm.name}</td><td>{itm.amount}</td><td>{itm.notes}</td>{itm.source}<td></td>
                    <td>
                        <InputGroup.Checkbox aria-label="Select for import" checked={importItem[itm.itemId] || false} onChange={async e => {
                            const itemId = itm.itemId;
                            console.log(`val=${itemId} ${e.target.checked}`);                            
                            if (e.target.checked) {
                                const { firstName, lastName } = nameToFirstLast(itm.name);
                                const tnts = await sqlFreeForm(`select tenantID from tenantInfo where firstName=? and lastName=?`,
                                    [firstName, lastName]);
                                const existing = get(tnts, '0.tenantID');
                                if (!existing) {
                                    setNeedCreateItem({
                                        ...needCreateItem,
                                        [itemId]: true,
                                    })
                                } else {

                                }
                            } else {
                                setNeedCreateItem({
                                    ...needCreateItem,
                                    [itemId]: false,
                                })
                            }
                            setImportItem({
                                ...importItem,
                                [itemId]: e.target.checked,
                            });
                        }} />
                    </td>
                    <td>
                        {
                            needCreateItem[itm.itemId] && <Button onClick={async () => {
                                const { firstName, lastName } = nameToFirstLast(itm.name);
                                const tenantID = v1();
                                await sqlFreeForm(`insert into tenantInfo( tenantID,firstName, lastName, email, phone, created, modified)
        values(?,?,?,?,?,now(),now())`, [tenantID, firstName, lastName,
                                    'no email', 'no phone',
                                ]);
                                
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
                    </td>
                </tr> 
            })
        }
    </Table>
}


export default PaymentMatch;