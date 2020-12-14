import React, { useState, useEffect } from 'react';
import { Modal, Container, Row, Col, Tabs, Tab, Form, DropdownButton, Dropdown, Button, Toast, InputGroup, ButtonGroup } from 'react-bootstrap';


import { GetOrCreate } from './GetOrCreate';

import { sqlFreeForm } from '../api';
import {
    saveTenantProcessorPayeeMapping,
} from '../aapi';
import { nameToFirstLast } from '../util';
import { add, get, set } from 'lodash';
import GenCrudAdd from '../GenCrudAdd';
import { createHelper } from '../datahelper';
export function TenantMatcher(props) {

    const { onClose, name, source } = props.context;
    const show = !!name;
    //const { show } = props;
    const [curTenantSelection, setCurTenantSelection] = useState({});
    const [showProgress, setShowProgress] = useState(false);
    const [columnInfo, setColumnInfo] = useState([]);
    const [isCreateNew, setIsCreateNew] = useState(false);
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

    const tenantID = get(curTenantSelection, 'value.tenantID');
    const mapToLabel = curTenantSelection.label;
    
    useEffect(() => {
        const helper = createHelper('tenantInfo');
        
        helper.loadModel().then(() => {
            const columnInfo = helper.getModelFields();
            setColumnInfo(columnInfo);
        });
    }, []);
    return <div >
        <Modal show={!!showProgress}>
            <Container>
                {showProgress}
            </Container>
        </Modal>
        <GenCrudAdd columnInfo={columnInfo} show={isCreateNew}
            onOK={added => {
                if (added) {

                } else {
                    setIsCreateNew(false);
                }
            }}
        ></GenCrudAdd>
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
                                <Row><Col>Ma: {mapToLabel} to {name} {source} {tenantID}</Col></Row>
                                <Row>
                                <Col xs={12} md={8}>
                                    <GetOrCreate context={{
                                        curSelection: curTenantSelection, setCurSelection: setCurTenantSelection,
                                        loadOptions: loadTenantOptions,
                                    }}></GetOrCreate>                                    
                        </Col>
                        <Col>
                            <Button onClick={() => {
                                setIsCreateNew(true);
                            }}>Create New</Button>
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