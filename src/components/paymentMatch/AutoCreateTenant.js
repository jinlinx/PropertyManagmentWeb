import React, { useState, useEffect } from 'react';
import { Table, Form, DropdownButton, Dropdown, Button, Toast, InputGroup } from 'react-bootstrap';
import { sqlGetTableInfo, sqlGetTables, sqlFreeForm } from '../api';
import { checkTenantProcessorPayee } from '../aapi';
import { nameToFirstLast } from '../util'
import { get } from 'lodash';
import { v1 } from 'uuid';
import moment from 'moment';
import Promise from 'bluebird';


export function AutoCreateTenant(props) {
    const { name, source } = props;
    useEffect(() => {
        
    },[]);
}