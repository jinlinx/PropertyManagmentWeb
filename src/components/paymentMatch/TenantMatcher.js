import React, { useState, useEffect } from 'react';
import { Modal, Container, Row, Col, Button, Alert } from 'react-bootstrap';


import { GetOrCreate } from './GetOrCreate';

import { sqlFreeForm } from '../api';
import {
    saveTenantProcessorPayeeMapping,
    getTenants,
    getHouses,
    getLeases,
    createLeaseTenantLink,
} from '../aapi';
import { nameToFirstLast } from '../util';
import { add, get, set } from 'lodash';
import GenCrudAdd from '../GenCrudAdd';
import { createHelper } from '../datahelper';
import { getFKDefs } from '../GenCrudTableFkTrans';

function AddNewDlgFunc(props) {
    const { curModalInfo,
         setShowProgress, setCurModalInfo } = props.context;
    const { table, editItem, setCurrSelection } = curModalInfo;
    const [columnInfo, setColumnInfo] = useState([]);
    
    const helper = createHelper(table);    
    useEffect(() => {
        if (helper) helper.loadModel().then(() => {
            const columnInfo = helper.getModelFields();
            setColumnInfo(columnInfo);
        });
    }, [table]);    
    if (!table) return <></>;
    return <GenCrudAdd table={table} columnInfo={columnInfo} show
        editItem={editItem}
        fkDefs={getFKDefs()}
        doAdd={
            (data, id) => {
                return helper.saveData(data, id).then(res => {
                    return res;
                }).catch(err => {
                    console.log(err);
                    setShowProgress(err.message);
                })
            }
        }
        onOK={added => {
            if (added) {
                setCurrSelection(added);                
            }
            //setIsCreateNew(false);
            setCurModalInfo({});
        }}
    ></GenCrudAdd>
}
export function TenantMatcher(props) {

    const { onClose, name, source,
        imported, setImported,
    } = props.context;
    const show = !!name;
    //const { show } = props;
    const [curTenantSelection, setCurTenantSelection] = useState({});
    const [curHouseSelection, setCurHouseSelection] = useState({});
    const [curLeaseSelection, setCurLeaseSelection] = useState({});
    const [showProgress, setShowProgress] = useState(false);
    const firstLast = nameToFirstLast(name || '');
    const [tenantName, setTenantName] = useState(firstLast.firstName);
    const getHouseLabel = r => `${r.address} ${r.city} ${r.state}`;
    const getLeaseLabel = r => `${r.comment} ${r.leaseID}`;
    useEffect(() => {
        setTenantName({
            firstName: firstLast.firstName || '',
            lastName: firstLast.lastName || '',
        });
    }, [firstLast.firstName, firstLast.lastName]);
    const loadTenantOptions = async (name = '') => {
        const { firstName, lastName } = nameToFirstLast(name || '');
        const res = await getTenants(firstName, lastName);
        const fm = res.map(r => ({
            label: `${r.firstName} ${r.lastName}`,
            value: r,
        }));
        return fm;
    };
    const loadHouseOptions = async (address = '') => {        
        const res = await getHouses(address);
        const fm = res.map(r => ({
            label: getHouseLabel(r),
            value: r,
        }));
        return fm;
    };

    const loadLeaseOptions = async (houseID, leaseComment = '') => {
        const res = await getLeases(houseID, leaseComment);
        const fm = res.map(r => ({
            label: getLeaseLabel(r),
            value: r,
        }));
        return fm;
    }
    
    const tenantID = get(curTenantSelection, 'value.tenantID');
    const mapToLabel = curTenantSelection.label;
    
    const applyTenantId = props.context.tenantID;
    useEffect(() => {
        if (props.context.tenantID) {
            setCurTenantSelection({
                label: name,
                value: {
                    tenantID: applyTenantId,
                }
            })
        }
    }, [tenantID, applyTenantId, curTenantSelection.length]);

    const createNewStyle = { fontSize: '9px' };    

    const [curModalInfo, setCurModalInfo] = useState({});
    const addNewBaseProps = {
        curModalInfo, setCurModalInfo,
        setShowProgress
    };
    const curSelectedHouseId = get(curHouseSelection, 'value.houseID', 'NA');
    console.log(`houseid is ${curSelectedHouseId}`);
    return <div >
        <Modal show={!!showProgress}>
            <Container>
                {showProgress}
            </Container>
        </Modal>
        <AddNewDlgFunc context={{
            ...addNewBaseProps,
        }}></AddNewDlgFunc>        
        <Modal show={show} onHide={onClose}>
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
                        <Col xs={8} md={8}>
                            {
                                applyTenantId ? <Alert variant="secondary">{ name }</Alert>:<GetOrCreate context={{
                                curSelection: curTenantSelection, setCurSelection: setCurTenantSelection,
                                loadOptions: loadTenantOptions,
                            }}></GetOrCreate>
                            }
                        </Col>
                        {!applyTenantId && <Col >
                            <Button size="sm" style={createNewStyle} disabled={!!applyTenantId} onClick={() => {
                                //setIsCreateNew(true);
                                setCurModalInfo({
                                    table: 'tenantInfo',
                                    editItem: tenantName,
                                    setCurSelection: added => {
                                        setCurTenantSelection({
                                            label: `${added.firstName} ${added.lastName}`,
                                            value: {
                                                tenantID: added.id,
                                            }
                                        })
                                    }
                                })
                            }}>Create New Tenant</Button>
                        </Col>
                        }
                    </Row>
                    {!applyTenantId && <Row>
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
                    }
                    <Row>
                        <Col xs={8} md={8}>
                            <GetOrCreate context={{
                                optionsAction: (options, setOptions, curSel) => {
                                    if (curSel.value && options.filter(o => o.value.id === curSel.value.id).length === 0) {
                                        setOptions([curSel].concat(options));
                                    }
                                },
                                curSelection: curHouseSelection, setCurSelection: setCurHouseSelection,
                                loadOptions: loadHouseOptions,
                            }}></GetOrCreate>
                        </Col>
                        <Col>
                            <Button disabled={!!showProgress} style={createNewStyle} onClick={() => {                                
                                setCurModalInfo({
                                    table: 'houseInfo',
                                    setCurrSelection: added => {
                                        setCurHouseSelection({
                                            label: getHouseLabel(added),
                                            value: added,
                                        });
                                        return added;
                                    }
                                })
                            }}>Create New House</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={8} md={8}>
                            <GetOrCreate context={{
                                reloadId: curSelectedHouseId,
                                optionsAction: (options, setOptions, curSel) => {
                                    if (curSel.value && options.filter(o => o.value.id === curSel.value.id).length === 0) {
                                        setOptions([curSel].concat(options));
                                    }
                                },
                                curSelection: curLeaseSelection, setCurSelection: setCurLeaseSelection,
                                loadOptions: comment => loadLeaseOptions(curSelectedHouseId, comment),
                            }}></GetOrCreate>
                        </Col>
                        <Col>
                            <Button disabled={!!showProgress} style={createNewStyle} onClick={() => {
                                setCurModalInfo({
                                    table: 'leaseInfo',
                                    editItem: {
                                        houseID: curSelectedHouseId,
                                        comment: `Auto created for ${name}`
                                    },
                                    setCurrSelection: added => {
                                        setCurLeaseSelection({
                                            label: getLeaseLabel(added),
                                            value: added,
                                        });
                                        return added;
                                    }
                                })
                            }}>Create New Lease</Button>
                        </Col>
                    </Row>
                    <Row>                        
                        <Col>
                            <Button disabled={!!showProgress} onClick={() => {
                                if (!curSelectedHouseId || curSelectedHouseId === 'NA'
                                    || !tenantID || !curLeaseSelection.value || !curLeaseSelection.value.leaseID
                                ) {
                                    setShowProgress('Please select a house to map to');
                                    setTimeout(() => setShowProgress(''), 2000);
                                    return;
                                }
                                setShowProgress('Please Wait');
                                saveTenantProcessorPayeeMapping({ tenantID, name, source })
                                    .then(async () => {
                                        const leaseID = curLeaseSelection.value.leaseID;
                                        await createLeaseTenantLink(leaseID, tenantID);
                                        setImported(imported.map(imp => {

                                            if (imp.tenantID === tenantID && imp.source === source) {
                                                return {
                                                    ...imp,
                                                    leaseID,
                                                }
                                            }
                                            return imp;
                                        }))
                                    })
                                    .then(() => {
                                        setShowProgress('');
                                        onClose();
                                    }).catch(err => {
                                        setShowProgress(err.message);
                                    });
                            }}>Create</Button>
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