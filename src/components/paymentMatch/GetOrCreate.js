import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup, ButtonGroup } from 'react-bootstrap';
import { get } from 'lodash';
import { v1 } from 'uuid';
import moment from 'moment';
import Promise from 'bluebird';

import EditDropdown from './EditDropdown';

import { sqlFreeForm } from '../api';

export function GetOrCreate(props) {    
    const { curSelection, setCurSelection, loadOptions, optionsAction, reloadId} = props.context;
    const [options, setOptions] = useState([]);    
    const getCurSelectionText = o => o.label || '';    
    useEffect(() => {       
        loadOptions().then(res => {            
            setOptions(res);
            if (res.length) {
                setCurSelection(res[0])
            }
        })
    }, [reloadId||'NA']);

    if (optionsAction) optionsAction(options, setOptions, curSelection);
    return <div>
        <EditDropdown context={{
            curSelection, setCurSelection, getCurSelectionText,
            options, setOptions,
            loadOptions,
        }}></EditDropdown>
    </div>

}