import React, { useState, useEffect } from 'react';
import { Modal, Container, Row, Col, Tabs, Tab, Form, DropdownButton, Dropdown, Button, Toast, InputGroup, ButtonGroup } from 'react-bootstrap';


import { GetOrCreate } from './GetOrCreate';

import { sqlFreeForm } from '../api';
import {
    saveTenantProcessorPayeeMapping,
    getHouses,
} from '../aapi';
import { nameToFirstLast } from '../util';
import { add, get } from 'lodash';
export function TenantMatcher(props) {

    const { onClose, name, source } = props.context;
    const show = !!name;
    //const { show } = props;
    const [curTenantSelection, setCurTenantSelection] = useState({});
    const [curHouseSelection, setCurHouseSelection] = useState({});
    const [showProgress, setShowProgress] = useState(false);
    const firstLast = nameToFirstLast(name || '');
    const [tenantName, setTenantName] = useState(firstLast.firstName);
    useEffect(() => {
        setTenantName({
            firstName: firstLast.firstName || '',
            lastName: firstLast.lastName || '',
        });
    }, [firstLast.firstName, firstLast.lastName]);
    const loadTenantOptions = async (name = '') => {
        const { firstName, lastName } = nameToFirstLast(name || '');
        const res = await sqlFreeForm(`select tenantID, firstName, lastName from tenantInfo 
        where firstName like ? or lastName like ?`, [`%${firstName}%`, `%${lastName}%`]);
        const fm = res.map(r => ({
            label: `${r.firstName} ${r.lastName}`,
            value: r,
        }));
        return fm;
    };

    const loadHouseOptions = async (address = '') => {
        const res = await getHouses(address);
        const fm = res.map(r => ({
            label: `${r.address} ${r.city} ${r.state}`,
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
                                <Col>< Form.Control as="input" value={tenantName.firstName} name="tenantFirstName" onChange={e => {                                    
                                    setTenantName({
                                        ...tenantName,
                                        firstName: e.target.value,
                                    })
                                }} /></Col>                                
                            </Row>
                            <Row>          
                                <Col>LastName</Col>
                                <Col>< Form.Control as="input" value={tenantName.lastName} name="tenantLastName" onChange={e => {
                                    setTenantName({
                                        ...tenantName,
                                        lastName: e.target.value,
                                    })
                                }} /></Col>
                            </Row>
                            <Row>
                                <Col>
                                    <GetOrCreate context={{
                                        curSelection: curHouseSelection, setCurSelection: setCurHouseSelection,
                                        loadOptions: loadHouseOptions,
                                    }}></GetOrCreate>
                                </Col>
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