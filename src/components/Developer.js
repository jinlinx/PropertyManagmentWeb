import React, {useState, useRef, useEffect} from 'react';
import {
    Navbar, Nav, NavDropdown, Form, FormControl, Button,
    Row, Col, Alert,
    Container
} from 'react-bootstrap';
import Promise from 'bluebird';
import moment from 'moment';
import {
    sqlFreeForm, getData, statementFuncs, doStatementWS,
    getSocket,
} from './api';

import {
    getImportLogs
} from './aapi';

function Developer(props) {
    const [askCode, setAskCode] = useState('');
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [timerId, setTimerId] = useState(0);
    const timerRef = useRef(null);
    useEffect(() => {
        doStatementWS();
    }, []);
    
    statementFuncs.listener = msg => {
        setMessage(msg);
    }
    statementFuncs.askCodeListener = msg => {
        setAskCode(msg);
    };
    statementFuncs.freeFormMsgListener = msg => {
        setMessage(JSON.stringify(msg));
    }
    const pullStatementMsg = () => {
        return;
        const tfunc = () => {
            getData('misc/getStatementProcessingMsg').then(msg => {
                setMessage(msg.message);
                console.log('timerid is = ' + timerRef.current);                
            });

        };
        const hndl = setInterval(tfunc, 100);
        console.log('start time=' + hndl);
        setTimerId(hndl);
        timerRef.current = hndl;
    }
    const importPayment = who => {
        setMessage('Please wait');
        getData(`misc/statement?who=${who}`).then(res => {
            setMessage('import done');
            setMessage(JSON.stringify(res));
        });
        pullStatementMsg();
    }
    return <Container>
        {
            askCode && <Row>
                <Col>{askCode}</Col>
                <Col><FormControl type="text" value={code || ''} placeholder="Code" className="mr-sm-2" onChange={e => {
                    setCode(e.target.value);
                }} /></Col>
                <Col><Button onClick={() => {
                    setAskCode('');
                    if (getSocket()) {
                        getSocket().emit('receivedStatementCode', code)
                    }
                }}>Send Code</Button></Col>
            </Row>
        }
        <Row>
            <Col><Button onClick={() => {
                setMessage('');
                setMessages([]);
            }}>Clear Messages</Button></Col>
            <Col><Button onClick={() => {
                getImportLogs().then(logs => {
                    setMessages(logs.map(l => `${moment(l.start).format('YYYY-MM-DD HH:mm:ss')} ${l.source} ${l.msg}`))
                });
            }}>Show import logs</Button></Col>
        </Row>
        <Row>
            <Col>
                <Alert variant="secondary">{message}</Alert>
            </Col>            
        </Row>
        <Row>
            <Col>
                {
                    messages.map(m => <Alert variant="secondary">{m}</Alert> )
                }                
            </Col>
        </Row>
        <Row>
            <Col><Button onClick={() => {
                // if (timerRef.current) {
                //     console.log('stop timer ' + timerRef.current);
                //     clearInterval(timerRef.current);
                //     timerRef.current = 0;
                //     setTimerId(0);
                // } else {
                //     pullStatementMsg();
                // }
            }}>{timerId ? 'Stop Timer' : 'Start Timer'}</Button></Col>
        </Row>
        <Row>
            <Col>
                <Button disabled={!!message} onClick={async () => {
                    setMessage(`Delete all is now disabled`);
                    return;
                    await Promise.map([
                        "houseInfo",
                        "ownerInfo",
                        "tenantInfo",
                        "payerTenantMapping",
                        "leaseInfo",
                        "rentPaymentInfo",
                        "leaseTenantInfo"], async name => {
                            setMessage(`deleting ${name}`);
                            const res = await sqlFreeForm(`delete from ${name}`);
                            console.log(res);
                            setMessage(`done delete ${name} affected=${res.affectedRows} changed=${res.changedRows}`)
                    });
                    await sqlFreeForm(`update importPayments set matchedTo=null`);
                }}>Delete All Data</Button>
            </Col>
            <Col>
                <Button disabled={ !!message } onClick={() => {
                    setMessage('Starting imports, please wait');
                    getData('misc/gsimport?who=tenant').then(res => {
                        setMessage('import done');
                        setMessages(res.map(m=>`${m.address} ${m.firstName} ${m.lastName}`))
                    });
                }}>Import Tenants</Button>
            </Col>
            <Col>
                <Button disabled={ !!message } onClick={() => {
                    setMessage('Starting imports, please wait');
                    getData('misc/gsimport?who=maintence').then(res => {
                        setMessage('import done');
                        setMessages([res.message]);
                    });
                }}>Import MaintenanceReport</Button>
            </Col>
        </Row>
        <Row>
            <Col>
                <Button disabled={!!message}  onClick={() => importPayment('paypal')}>Import Paypal</Button>
            </Col>
            <Col>
                <Button disabled={!!message}  onClick={() => importPayment('venmo')}>Import Venmo</Button>
            </Col>
            <Col>
                <Button disabled={!!message} onClick={() => importPayment('cashapp')}>Import Cashapp</Button>
            </Col>
        </Row>
        <Row>
            <Col>
                <Button onClick={() => {
                    const skt = getSocket();
                    if (!skt) return;
                    skt.emit('ggFreeFormMsg', {
                        type: 'text',
                        data: new Date().toISOString(),
                    })
                }}>Test Free Form</Button>
            </Col>            
        </Row>
    </Container>
}

export default Developer;