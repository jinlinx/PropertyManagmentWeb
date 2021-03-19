import React, {useEffect, useState} from 'react';
import GenList from './GenList';
import { fmtDate } from './util';
import {Modal, Button, Table, InputGroup} from 'react-bootstrap';
import {sqlGet} from './api';
import EmailTemplate from './leaseEmail/emailTemplate';
import moment from 'moment';
function PaymentList(props) {

    const [pageState, setPageState] = useState({
        retrivingData: 0,
        operationText: '',
        leaseIDToSearch: null,
        tenants: [],
        row: {},
    });

    const [selectedEmails, setSelectedEmails] = useState([]);
    const [template, setTemplate] = useState({
        subject: '',
        data: '',});
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
            setTemplate(state => {
                const row = pageState.row;
                const part2 = (row && row.address)?`of ${row.address} ${moment(row.receivedDate).format('YYYY-MM-DD')} Amount: ${row.receivedAmount}`:'';
                return {
                    ...state,
                    data: `For ${res.rows.map(r => `${r.firstName} ${r.lastName}`).join(',')} ${part2}`,
                }
            });
        })
    },[pageState.leaseIDToSearch]);
    const emailClick = (name, row)=>{
        //console.log('val is onemail click ' + val);
        console.log(row.leaseID);
        setPageState(state => {
            return ({
                ...state,
                leaseIDToSearch: row.leaseID,
                retrivingData: state.retrivingData + 2,
                row,
                operationText: `Getting email list for ${name}`,
            })
        });
        
        setTemplate(() => {
            let part1 = '';
            if (pageState.tenants) {
                part1 = 'For ' + pageState.tenants.map(t => `${t.firstName} ${t.lastName}`).join(',') + ':'
            }
            return {
                subject: `Invoice for ${row.address} ${moment(row.receivedDate).format('YYYY-MM-DD')}`,
                data: part1 + `Invoice for ${row.address} ${moment(row.receivedDate).format('YYYY-MM-DD')} Amount: ${row.receivedAmount}`,
            };
        })
    };
    const handleClose = ()=>{
        setPageState(state=>({
            ...state,
            retrivingData: 0,
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
                    updateEmail: () => { },
                    template, setTemplate,
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