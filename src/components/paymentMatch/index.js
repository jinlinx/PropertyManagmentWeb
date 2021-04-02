import React, { useState, useEffect } from 'react';
import { Table, DropdownButton, Dropdown, Button, InputGroup } from 'react-bootstrap';
import {orderBy} from 'lodash';
import { TenantMatcher } from './TenantMatcher';
import { sqlGet } from '../api';
import { getImportablePayments, deletePaymentImport, linkPayments } from '../aapi';
import EditDropdown from './EditDropdown';

function PaymentMatch(props) {
    const [imported, setImported] = useState([]);
    const [importItem, setImportItem] = useState({});


    const [needCreateItem, setNeedCreateItem] = useState({});
    const [matchedTo, setMatchedTo] = useState({});
    const [createTenantItem, setCreateTenantItem] = useState({});

    const [itemPaymentTypeSelection, setItemPaymentTypeSelection] = useState({});

    const [paymentTypes, setPaymentTypes] = useState([]);
    useEffect(() => {        
        const doLoad = async()=>{
            const paymentTypeRes = await sqlGet({
                table:'paymentType'
            });
            const paymentTypes = orderBy(paymentTypeRes.rows,['displayOrder']);
            setPaymentTypes(paymentTypes);
            const r = await getImportablePayments();
            setImported(r.map(r => {
                const paymentTypeID = paymentTypes.reduce((acc,pt)=>{
                    if (r.notes.toLowerCase().indexOf(pt.paymentTypeName.toLowerCase()) >= 0) {
                        return pt.paymentTypeID;
                    }
                    return acc;
                }, '1');                
                itemPaymentTypeSelection[r.id] = paymentTypes.find(t=>t.paymentTypeID === paymentTypeID);                
                return {
                    ...r,
                    paymentTypeID,
                    itemId: r.id,
                }
            }));
            setItemPaymentTypeSelection({...itemPaymentTypeSelection});
            setImportItem(r.reduce((acc, rr) => { 
                if (rr.leaseID) acc[rr.id] = true;
                return acc;
            }, {}))
        };
        doLoad();
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
            <td>Date</td><td>Name</td><td>Amount</td><td>Note</td><td>Source</td><td>Type</td>
            <td>Add</td></tr></thead>
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
                        { importItem[itm.itemId] && <Button onClick={()=>{
                            console.log('Posting payment datad');
                            console.log({
                                ids:[itm.itemId],
                                paymentTypeID: itm.paymentTypeID
                            })
                            linkPayments({
                                ids:[itm.itemId],
                                paymentTypeID: itm.paymentTypeID
                            }).then(r=>{
                                setImported(imported.filter(r => r.id !== itm.id)); 
                            }).catch(err=>{
                                console.log(`TODO got error ${err.message}`);
                            });
                        }}>Create</Button>
                    }
                    </td>
                    <td>
                        {
                            <>
                            <EditDropdown context={{
                                disabled: false,
                                curSelection: itemPaymentTypeSelection[itm.itemId], setCurSelection: sel=>{
                                    setItemPaymentTypeSelection(state=>({
                                        ...state,
                                        [itm.itemId]: sel,
                                    }));
                                }, getCurSelectionText: t=>{                       
                                    return t?.paymentTypeName;
                                },
                                options: paymentTypes, setOptions: ()=>{},
                                loadOptions: ()=>{},
                            }}></EditDropdown>
                            
                            </>
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
                            //sqlFreeForm(`update importPayments set deleted='1' where id=? `, [itm.id])
                            deletePaymentImport(itm.id).then(() => {
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