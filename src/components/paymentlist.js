import React, {useEffect, useState} from 'react';
import GenList from './GenList';
import { fmtDate } from './util';
import {Modal, Button} from 'react-bootstrap';
import {sqlGet} from './api';
function PaymentList(props) {

    const [pageState, setPageState] = useState({
        retrivingData: 0,
        operationText: '',
        leaseIDToSearch: null,
        tenants:[],
    });

    useEffect(()=>{
        if (!pageState.leaseIDToSearch) return;
        sqlGet({
            table:'leaseTenantInfo',
            whereArray:[{field:'leaseID', val:pageState.leaseIDToSearch, op:'='}]            
        }).then(res=>{
            console.log(res);
            setPageState(state=>({
                ...state,
                leaseIDToSearch: null,
                retrivingData: state.retrivingData-1,
                operationText: ``,
                tenants: res.rows,
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
    return <>
    <Modal show={!!pageState.retrivingData} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Please Wait</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div>{pageState.operationText}</div>
            <ul>
            {                
                pageState.tenants.map(tenant=>{
                    return <li>{tenant.firstName} {tenant.lastName} email={tenant.email}</li>
                })
            }
            </ul>
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