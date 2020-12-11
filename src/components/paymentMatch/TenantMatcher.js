import React, { useState, useEffect } from 'react';
import { Modal, Container, Row, Col, Tabs, Tab, Form, DropdownButton, Dropdown, Button, Toast, InputGroup, ButtonGroup } from 'react-bootstrap';


import { GetOrCreate } from './GetOrCreate';

import { sqlFreeForm } from '../api';
import { nameToFirstLast } from '../util';
export function TenantMatcher(props) {

    const { onClose, name } = props.context;
    const show = !!name;
    //const { show } = props;
    const [curTenantSelection, setCurTenantSelection] = useState({});    
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
        
    return <div >
        <Modal show={show}>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Matching name {name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
                <Container>
                    <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                        <Tab eventKey="LinkExisting" title="Link Existing">                            
                            <Container>
                                <Col xs={12} md={8}>
                                    <GetOrCreate context={{
                                        curSelection: curTenantSelection, setCurSelection: setCurTenantSelection,
                                        loadOptions: loadTenantOptions,
                                    }}></GetOrCreate>
                                    .col-xs-12 .col-md-8                             
                                </Col>
                            </Container>                            
                        </Tab>
                        <Tab eventKey="new" title="Create New">
                            <div>2</div>
                        </Tab>
                        <Tab eventKey="contact" title="Contact" disabled>
                            <div>3</div>
                        </Tab>
                    </Tabs>
                    <Row>
                        <Col xs={12} md={8}>
                            .col-xs-12 .col-md-8
                             
            </Col>
                        <Col xs={6} md={4}>
                            .col-xs-6 .col-md-4
            </Col>
                    </Row>

                    <Row>
                        <Col xs={6} md={4}>
                            .col-xs-6 .col-md-4
                        </Col>
                        <Col xs={6} md={4}>
                            .col-xs-6 .col-md-4
                        </Col>
                        <Col xs={6} md={4}>
                            .col-xs-6 .col-md-4
                        </Col>
                    </Row>
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