import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup, ButtonGroup } from 'react-bootstrap';
import { get } from 'lodash';
import { v1 } from 'uuid';
import moment from 'moment';
import Promise from 'bluebird';

import EditDropdown from './EditDropdown';

import { sqlFreeForm } from '../api';

export function GetOrCreate(props) {
    
    const [curSelection, setCurSelection] = useState('');
    const [options, setOptions] = useState([]);    
    const getCurSelectionText = o => o.label;
    const loadOptions = async (name='') => {
        const res = await sqlFreeForm(`select tenantID, name from payerTenantMapping where name like ?`, [`%${name}%`]);
        const fm = res.map(r => ({
            label: r.name,
            value: r,
        }));        
        return fm;
    };
    useEffect(() => {       
        loadOptions().then(res => {            
            setOptions(res);
            if (res.length) {
                setCurSelection(res[0])
            }
        })
    }, []);

    return <div>
        <EditDropdown context={{
            curSelection, setCurSelection, getCurSelectionText,
            options, setOptions,
            loadOptions,
        }}></EditDropdown>
    </div>

}