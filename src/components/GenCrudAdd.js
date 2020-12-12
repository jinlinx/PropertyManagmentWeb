import React, { useState, useEffect } from 'react';
import Select from 'react-dropdown-select';
import { createAndLoadHelper } from './datahelper';
import { Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import get from 'lodash/get';

const GenCrudAdd=(props) => {

    const { columnInfo, doAdd, onCancel,
        editItem, //only available during edit
        onError,
        customSelData,
        customFields = {},
        show,
    }
        =props;
    let id='';
    const initData=columnInfo.reduce((acc, col) => {
        acc[col.field]='';
        if (editItem) {
            const val=editItem[col.field];
            acc[col.field]=val===0? 0:val||'';
            if (col.isId) {
                id=val;
            }
        }
        return acc;
    }, {});
    const requiredFields = columnInfo.filter(c => c.required && !c.isId).map(c => c.field);
    const requiredFieldsMap = requiredFields.reduce((acc, f) => {
        acc[f] = true;
        return acc;
    }, {});

    const [data, setData]=useState(initData);
    const [optsData, setOptsData]=useState(customSelData||{});
    const handleChange=e => {
        const { name, value }=e.target;
        setData({ ...data, [name]: value });
    }

    const handleSubmit=e => {
        e.preventDefault();

        const missed=requiredFields.filter(r => !data[r]);
        if (missed.length===0) {
            handleChange(e, doAdd(data, id));
        } else {
            if (onError) {
                onError({
                    message: `missing required fields ${missed.length}`,
                    missed,
                });
            }
            return;
        }
        const onOK = props.onOK || onCancel;
        onOK({
            id,
            ...data,
        });
    }

    const optsDataReqSent={

    }

    useEffect(() => {
        async function doLoads() {
            let cur=optsData;;
            for (let i=0; i<columnInfo.length; i++) {
                const c=columnInfo[i];
                if (c.foreignKey) {
                    const optKey=c.foreignKey.table;

                    if (!optsData[optKey]) {
                        const helper = await createAndLoadHelper(optKey);
                        //await helper.loadModel();
                        const optDataOrig=await helper.loadData();
                        const optData = optDataOrig.rows;
                        cur=Object.assign({}, cur, {
                            [optKey]: props.processForeignKey(c.foreignKey, optData)
                        });
                    }
                }
            }

            setOptsData(cur);
            
        }
        doLoads();
    }, []);

    const checkErrorInd = c => {
        if (requiredFieldsMap[c.field] && !data[c.field])
            return "alert-danger";
        return '';
    }
    return (
        <Modal show={show} onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>Add</Modal.Title>
            </Modal.Header>
            <Container>
            {
                columnInfo.map( ( c, cind ) => {
                    if(!editItem) {
                        if(c.isId) return null;
                    }                    

                    const createSelection=( optName, colField ) => {
                        let selected={};
                        const options=optsData[ optName ];
                        if ( options ) {
                            selected=options.filter( o => o.value===get( data, colField ) )[ 0 ]||{};
                        }
                        return <Select options={options} searchBy={'name'}
                            values={[ selected ]}
                            onChange={( value ) => {
                                if ( value[ 0 ] ) {
                                    handleChange( {
                                        target: {
                                            name: colField,
                                            value: value[ 0 ].value,
                                        }
                                    } )
                                }
                            }
                            }></Select>
                    };
                    let foreignSel=null;
                    if (c.foreignKey) {
                        const optKey = c.foreignKey.table;
                        const lm = async () => {
                            if (!optsData[optKey] && !optsDataReqSent[optKey]) {
                                optsDataReqSent[optKey] = true;
                                const helper = await createAndLoadHelper(optKey);
                                //await helper.loadModel();
                                const optData = await helper.loadData();
                                setOptsData({
                                    ...optsData,
                                    [optKey]: props.processForeignKey(c.foreignKey, optData)
                                });
                            }
                        }
                        //lm();
                        
                        //{value:1,label:'opt1'},{value:2,label:'opt2'}
                        
                        foreignSel=createSelection( optKey, c.field );
                    }
                    const custFieldType=customFields[ c.field ];
                    if ( custFieldType==='custom_select' ) {
                        foreignSel=createSelection( c.field, c.field );
                    }
                    const fieldFormatter=c.dspFunc||(x => x);
                    return <Row key={cind}>
                        <Col>{c.desc}</Col>
                        <Col className={checkErrorInd(c)}>
                            {
                            foreignSel ||< Form.Control as="input" value={fieldFormatter(data[c.field])} name={c.field} onChange={handleChange} />                        
                            }                            
                        </Col>
                        <Col xs={1} className={checkErrorInd(c)}>{checkErrorInd(c) && '*'}</Col>
                    </Row>
                })
                }
                <Modal.Footer>
                <Row>
                    <Col>
                        <Button className="btn-primary" type="submit" onClick={handleSubmit} >Add</Button>
                    </Col>
                    <Col>
                        <Button className="btn-secondary" onClick={onCancel} >Cancel</Button>
                    </Col>
                    </Row>
                </Modal.Footer>
            </Container>
        </Modal>
    )
}

export default GenCrudAdd;