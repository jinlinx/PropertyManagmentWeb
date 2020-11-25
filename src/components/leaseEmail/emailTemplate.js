import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup, Tab } from 'react-bootstrap';
const { sqlFreeForm } = require('../api');
export default function EmailTemplate(props) {
    const { leaseID,
        context
    } = props;
    const { selectedEmails, setSelectedEmails, } = context;
    const [template, setTemplate] = useState({});
    
    const load = () => {
        sqlFreeForm(`select subject, data
        from leaseEmailTemplate where leaseID=?`,[leaseID]).then(res => {
            setTemplate(res[0]);
        })
    }
    useEffect(() => {
        load();
    }, [leaseID]);    
    
    return <div>    
        <Table>
            <tbody>                
                {
                    selectedEmails && selectedEmails.map((l, ind) => {
                        return <tr key={ind}><td>
                            < Form.Control as="input" value={l.email} name={'email' + ind} onChange={e => {
                             console.log(e.target.value)   
                            }} />    
                        </td></tr>
                    })
                }
            </tbody>
        </Table>
    </div>
}