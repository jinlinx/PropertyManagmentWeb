import React, { useState, useEffect } from 'react';
import { Modal, Container, Row, Col, Tabs, Tab, Form, DropdownButton, Dropdown, Button, Toast, InputGroup, ButtonGroup } from 'react-bootstrap';


import { GetOrCreate } from './GetOrCreate';

import { sqlFreeForm } from '../api';
import { saveTenantProcessorPayeeMapping} from '../aapi';
import { nameToFirstLast } from '../util';
import { get } from 'lodash';
export function TenantMatcher(props) {

    const { onClose, name, source } = props.context;
    const show = !!name;
    //const { show } = props;
    const [curTenantSelection, setCurTenantSelection] = useState({});    
    const [showProgress, setShowProgress] = useState(false);
    const firstLast = nameToFirstLast(name);
    const [tenantFirstName, setTenantFirstname] = useState(firstLast.firstName);
    const [tenantLastName, setTenantLastname] = useState(firstLast.lastName);
    const loadTenantOptions = async (name = '') => {
        const { firstName, lastName } = nameToFirstLast(name);
        const res = await sqlFreeForm(`select tenantID, firstName, lastName from tenantInfo 
        where firstName like ? and lastName like ?`, [`%${firstName}%`, `%${firstName}%`]);
        const fm = res.map(r => ({
            label: `${r.firstName} ${r.lastName}`,
            value: r,
        }));
        return fm;
    };
    const tenantID = get(curTenantSelection, 'value.tenantID');
    const mapToLabel = curTenantSelection.label;
    console.log(curTenantSelection);
    return <div >
        <Modal show={!!showProgress}>
            <Container>
                {showProgress}
            </Container>
        </Modal>
        <Modal show={show}>
            <Modal.Header closeButton onClick={() => {
                onClose();
            }}>
                <Modal.Title id="contained-modal-title-vcenter">
                    Matching name {name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <Container>
                    <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                        <Tab eventKey="LinkExisting" title="Link Existing">                            
                            <Container>
                                <Row><Col>Ma: {mapToLabel} to {name} {source} {tenantID}</Col></Row>
                                <Row>
                                <Col xs={12} md={8}>
                                    <GetOrCreate context={{
                                        curSelection: curTenantSelection, setCurSelection: setCurTenantSelection,
                                        loadOptions: loadTenantOptions,
                                    }}></GetOrCreate>                                    
                                </Col>
                                <Col>
                                        <Button disabled={!!showProgress} onClick={() => {                                            
                                            if (!tenantID) {
                                                setShowProgress('Please select a tenant to map to');
                                                setTimeout(() => setShowProgress(''), 2000);
                                                return;
                                            }                                        
                                            setShowProgress('Please Wait');
                                            saveTenantProcessorPayeeMapping({ tenantID, name, source })
                                            .then(() => {
                                                setShowProgress('');
                                            }).catch(err => {
                                                setShowProgress(err.message);
                                            });
                                    }}>Link</Button>
                                    </Col>
                                </Row>
                            </Container>                            
                        </Tab>
                        <Tab eventKey="new" title="Create New">
                            <Row>
                                <Col>FirstName</Col>
                                <Col>< Form.Control as="input" value={tenantFirstName} name="tenantFirstName" onChange={e => {
                                    setTenantFirstname(e.target.value);
                                }} /></Col>                                
                            </Row>
                            <Row>          
                                <Col>LastName</Col>
                                <Col>< Form.Control as="input" value={tenantLastName} name="tenantLastName" onChange={e => {
                                    setTenantLastname(e.target.value);
                                }} /></Col>
                            </Row>
                        </Tab>                        
                    </Tabs>                    
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button  onClick={
                    () => {
                        onClose();
                    }
                }>Close</Button>
            </Modal.Footer>
        </Modal>        
    </div>

}