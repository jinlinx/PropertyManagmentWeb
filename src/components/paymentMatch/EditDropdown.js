import React, { useState, useEffect, createRef } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup, ButtonGroup } from 'react-bootstrap';
import { get } from 'lodash';


export default function EditDropdown(props) {
    const {
        options, loadOptions,
        setOptions,
        getCurSelectionText,
        curSelection, setCurSelection,
        MAXITEMS = 20,
    } = props.context;

    const selTextRef = createRef();
    const [show, setShow] = useState(false);

    return <div>
        <Dropdown as={ButtonGroup} show={show}>            
            < Form.Control as="input"
                ref={selTextRef}                
                value={getCurSelectionText(curSelection)}
                onBlur={() => {
                    setShow(false);
                }}
                onKeyDown={
                    async e => {
                        if (!curSelection || !curSelection.label) return;
                        if (e.key === 'Tab') {
                            setShow(false);
                        }
                        if (e.key !== 'Tab' && e.key !=='Home') {
                            setShow(true);
                            e.preventDefault();
                            const { selectionStart, selectionEnd } = e.target

                            const starts = curSelection.label.substring(0, selectionStart) + (e.key.length ===1?e.key:'');
                                              
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
            />                        
            <Dropdown.Toggle split variant="success" id="dropdown-split-basic" onClick={() => {
                setShow(!show);
            }} onBlur={() => {
                setShow(false);
            }}/>
            <Dropdown.Menu show={show}>
                {
                    options.map((l, ind) => {
                        return <Dropdown.Item key={ind} onSelect={() => setCurSelection(l)}>{getCurSelectionText(l)}</Dropdown.Item>
                    })
                }
            </Dropdown.Menu>
        </Dropdown>        
    </div>

}