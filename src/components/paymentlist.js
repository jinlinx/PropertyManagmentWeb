import React, {useEffect, useState} from 'react';
import GenList from './GenList';
import { fmtDate } from './util';
import {Modal, Button, Table, InputGroup} from 'react-bootstrap';
import {sqlGet} from './api';
import EmailTemplate from './leaseEmail/emailTemplate';
function PaymentList(props) {

    const [pageState, setPageState] = useState({
        retrivingData: 0,
        operationText: '',
        leaseIDToSearch: null,
        tenants:[],
    });

    const [selectedEmails, setSelectedEmails] = useState([]);

    useEffect(()=>{
        if (!pageState.leaseIDToSearch) return;
        sqlGet({
            table:'leaseTenantInfo',
            whereArray:[{field:'leaseID', val:pageState.leaseIDToSearch, op:'='}]            
        }).then(res=>{
            console.log(res);
            setPageState(state=>({
                ...state,
                retrivingData: state.retrivingData-1,
                operationText: ``,
                tenants: res.rows,
            }));
            setSelectedEmails(res.rows.map(r=>{
                return {
                    email: r.email,
                    origEmail: r.email.toLowerCase(),
                }
            }));
        })
    },[pageState.leaseIDToSearch]);
    const emailClick = (name, row)=>{
        //console.log('val is onemail click ' + val);
        console.log(row.leaseID);
        setPageState(state=>({
            ...state,
            tenants:[],
            leaseIDToSearch: row.leaseID,
            retrivingData: state.retrivingData+2,
            operationText: `Getting email list for ${name}`,
        }));        
    };
    const handleClose = ()=>{
        setPageState(state=>({
            ...state,
            retrivingData: state.retrivingData-1,
        }));
    };
    const selectedEmailMap = selectedEmails.reduce((acc, email) => {
        acc[email.email.toLowerCase()] = true;
        return acc;
    }, {});
    function addEmail(email) {
        if (!email) return;
        if (selectedEmailMap[email.toLowerCase()]) return;
        setSelectedEmails(state=>([
            ...state,
            {
                origEmail: email.toLowerCase(),
                email,
            }
        ]));
    }
    function deleteEmail(email) {
        email = email || '';
        if (!selectedEmailMap[email.toLowerCase()]) return;
        setSelectedEmails(state=>{
            return state.filter(s=>s.origEmail!== email.toLowerCase());
        });
    }
    return <>
    <Modal show={!!pageState.retrivingData} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Please Wait</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div>{pageState.operationText}</div>            
            <Table>
            <tbody>
                <tr><td></td><td>firstName</td><td>Last Name</td><td>Email</td></tr>
                {
                    pageState.tenants.map((l,ind) => {
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
            <EmailTemplate leaseID={pageState.leaseIDToSearch} context={{
            selectedEmails, setSelectedEmails,
            addEmail,
            deleteEmail,
            updateEmail: ()=>{},
        }} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>          
        </Modal.Footer>
      </Modal>
    <GenList 
    {...props}
    table={'rentPaymentInfo'}    
        displayFields={
            //actualy don't need to do this
            [
                {
                    field: 'receivedDate', desc: 'Date Received', dspFunc: fmtDate
                },
                {field: 'receivedAmount',desc: 'Received Amount',},
                { field: 'paidBy', desc: 'Paid By',  dspFunc: (name, row)=>{
                    return <button type="button" className="btn btn-link" onClick={()=>emailClick(name, row)}>{name}</button>;
                }},
                //{field: 'paymentType',desc: 'Payment Type',},
                //{ field: 'comment', desc: 'Lease' },
                { field: 'address', desc: 'Address' },
                {field:'paymentTypeName', desc:'PaymentType'}
                //{field: 'ownerID',desc: 'Owner ID',require: true,foreignKey: {table: 'ownerInfo',field: 'ownerID'}},
            ]
        }
        
        title={'Payment List'} /></>
}

export default PaymentList;