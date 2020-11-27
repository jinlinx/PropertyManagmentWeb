import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup, Tab } from 'react-bootstrap';
const { sqlFreeForm, sendEmail } = require('../api');
export default function EmailTemplate(props) {
    const { leaseID,
        context
    } = props;
    const { selectedEmails,
        addEmail,
        setSelectedEmails,
        deleteEmail,
        updateEmail,
    } = context;
    const getEmptyTemplate = () => ({
        subject: '',
        data: '',})
    const [newEmail, setNewEmail] = useState('');
    const [template, setTemplate] = useState(getEmptyTemplate());
    
    const load = () => {
        sqlFreeForm(`select leaseID, subject, data
        from leaseEmailTemplate where leaseID=?`,[leaseID]).then(res => {
            setTemplate(res[0] || getEmptyTemplate());
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
                                setSelectedEmails(selectedEmails.map(em => {
                                    if (em.dbEmail === l.dbEmail) {
                                        return {
                                            ...em,
                                            email: e.target.value.trim()
                                        }
                                    }
                                    return em;
                                }))
                            }} />    
                        </td><td><Button onClick={() => {
                                console.log(`updating email ${l.dbEmail}=>${l.email}`);
                                updateEmail(l)
                            }}>Save</Button></td>
                            <td><Button onClick={() => {                                
                                deleteEmail(l.email);
                            }}>Delete</Button></td>
                        </tr>
                    })
                }
                <tr><td>< Form.Control as="input" value={newEmail} name={'newEmail'} onChange={e => {
                    setNewEmail(e.target.value);
                }} /> </td><td><Button onClick={() => {
                        if (selectedEmails.filter(e => e.email.toLowerCase() === newEmail.toLowerCase().trim())) {
                            setNewEmail('');
                            return;
                        }
                        addEmail(newEmail.trim()).then(() => {
                            setNewEmail('');
                        })                        
                }}>Add</Button></td></tr>
            </tbody>
        </Table>
        <Form>
            <Form.Group controlId="subject">
                <Form.Label>Subject</Form.Label>
                <Form.Control type="input" placeholder="Subject" value={template.subject} onChange={e => {
                    setTemplate({
                        ...template,
                        subject: e.target.value,
                    })
                }} />                
            </Form.Group>

            <Form.Group controlId="body">
                <Form.Label>Email Body</Form.Label>
                <Form.Control as="textarea" rows={10} value={template.data} onChange={e => {
                    //template.data = e.target.value;
                    setTemplate({
                        ...template,
                        data: e.target.value,
                    })
                }} />
            </Form.Group>
            <Form.Group controlId="saveSubmit">
                <Button variant="primary" type="button" onClick={() => {
                    const to = selectedEmails.map(r => r.email);
                    console.log(to);
                    const { subject, data: text } = template;
                    console.log(`${subject} ${text}`);
                    sendEmail({ from: '"Jinlin" <jinlinx@hotmail.com>', to, subject, text }).then(r => {
                        console.log(r);
                    })
                }}>
                    Send email
            </Button>
                <Form.Text className="text-muted">
                    email or save
                </Form.Text>
                <Button variant="primary" type="button" onClick={() => {
                    if (!template.leaseID) {
                        sqlFreeForm(`insert into leaseEmailTemplate (leaseID, subject ,data)
                        values (?,?,?)`, [leaseID, template.subject, template.data]);
                    } else {
                        sqlFreeForm(`update leaseEmailTemplate set
                        subject=?, data=? where leaseID=?`, [template.subject, template.data, leaseID]);
                    }
                }}>
                    Save
            </Button>

            </Form.Group>
        </Form>
    </div>
}