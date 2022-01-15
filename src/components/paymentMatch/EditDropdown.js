import React, { useState, useEffect, createRef } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup, ButtonGroup } from 'react-bootstrap';
import { get } from 'lodash';


export default function EditDropdown(props) {
    const {
        options, loadOptions,
        setOptions,
        getCurSelectionText,
        curSelection, setCurSelection,
        disabled,
        MAXITEMS = 20,
    } = props.context;

    const selTextRef = createRef();
    const [show, setShow] = useState(false);
    const dropdownShowClassName = show ? "dropdown-menu show" : "dropdown-menu";
    return <div>
        {false && <Dropdown as={ButtonGroup} show={false} >
            < Form.Control as="input"
                disabled={disabled}
                ref={selTextRef}
                value={getCurSelectionText(curSelection)}
                onBlur={() => {
                    setShow(false);
                }}
                onKeyDown={
                    async e => {
                        if (!curSelection) return;
                        if (e.key === 'Tab') {
                            setShow(false);
                        }
                        if (e.key !== 'Tab' && e.key !== 'Home') {
                            setShow(true);
                            e.preventDefault();
                            const { selectionStart, selectionEnd } = e.target

                            const starts = (curSelection.label || '').substring(0, selectionStart) + (e.key.length === 1 ? e.key : '');
                                              
                            const foundOs = options.map(o => {
                                return {
                                    opt: o,
                                    ind: o.label.toLowerCase().indexOf(starts.toLowerCase())
                                };
                            }).filter(o => o.ind >= 0).sort((a, b) => a.ind - b.ind);
                            const found = get(foundOs, '0.opt');
                            if (!found) {
                                const newOpts = await loadOptions(starts);
                                if (newOpts.length) {
                                    if (options.length + newOpts.length > MAXITEMS) {
                                        setOptions(newOpts.concat(options.slice(0, options.length - newOpts.length)));
                                    }
                                }
                                return setCurSelection({
                                    value: null,
                                    label: curSelection.label,
                                });
                            }
                            setCurSelection({
                                ...found,
                            });
                            if (selTextRef.current) {
                                const posAdd = (e.key === 'ArrowLeft' || e.key === 'Backspace') ? -1 : 1;
                                selTextRef.current.value = found.label;
                                let newStart = selectionStart + posAdd;
                                if (newStart <= 0) newStart = 0;
                                selTextRef.current.selectionStart = newStart;
                                selTextRef.current.selectionEnd = found.label.length;
                                //selTextRef.current.selectionEnd = found.label.length;
                            }
                        }
                    }
                }
                onChange={() => { }}
            />
            <Dropdown.Toggle disabled={disabled} split variant="success" id="dropdown-split-basic" onClick={() => {
                setShow(!show);
            }} onBlur={() => {
                setTimeout(() => setShow(false), 400);
            }} />
            <Dropdown.Menu show={show}>
                {
                    options.map((l, ind) => {
                        return <Dropdown.Item key={ind} onSelect={() => {
                            console.log('selection ' + l);
                            setCurSelection(l);
                            setShow(false);
                        }
                        }>old{getCurSelectionText(l)}</Dropdown.Item>
                    })
                }
            </Dropdown.Menu>
        </Dropdown>
        }    
        <div className="btn-group">
            <input className="form-control"
                value={getCurSelectionText(curSelection)}
                onChange={() => { }}
                onBlur={() => {
                    setShow(false);
                }}></input>
            <button type="button" className="btn btn-primary dropdown-toggle dropdown-toggle-split" 
                onClick={() => setShow(!show)}
                onBlur={() => {
                    setTimeout(() => setShow(false), 400);
                }}
            >
                <span className="sr-only">Toggle Dropdown</span>
                <div className="btn-group">
                    <div className={dropdownShowClassName}>
                        {
                            options.map((l, ind) => {
                                return <a className="dropdown-item" key={ind} onClick={() => {
                                    console.log('selection ' + l);
                                    setCurSelection(l);
                                    setShow(false);
                                }
                                }>{getCurSelectionText(l)}</a>
                            })
                        }
                    </div>
                </div>
            </button>            
        </div>
    </div>

}