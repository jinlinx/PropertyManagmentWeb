import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { get } from 'lodash';

export function setVal(state, name, val) {
    return {
        ...state,
        values: {
            ...state.values,
            [name]: val,
        }
    }
}

export function getVal(state, name, defVal) {
    return get(state, ['values',name], defVal);
}

export function setErr(state, name, val) {
    return {
        ...state,
        errors: {
            ...state.errors,
            [name]: val,
        }
    }
}

/*
<Toast onClose={() => setAddColumnError('')} show={!!addColumnError} delay={3000} autohide>
    <Toast.Header>
        <strong className="mr-auto">Error</strong>
        <small>.</small>
    </Toast.Header>
    <Toast.Body>{addColumnError}</Toast.Body>
</Toast>
*/
export function getErr(state, name, defVal) {
    return get(state, ['errors', name], defVal);
}

export function createStateContext([state, setState]) {
    return {
        setVal: (name, val) => setState(setVal(state, name, val)),
        getVal: (name, defVal) => getVal(state, name, defVal),
        setErr: (name, err) => setState(setErr(state, name, err)),
        getErr: (name, defVal)=>getErr(state, name, defVal),
    }
}

export function TextInputWithError(props) {
    const { name, stateGetSet } = props;
    const [value, changeFunc] = stateGetSet;
    const errorText = getErr(value, name, '');
    return <InputGroup>
        <Form.Control
            type="text"
            placeholder={name}
            name={name}
            value={getVal(value,name,'')}
            onChange={e => {                                
                changeFunc(setVal(value, name, e.target.value))
            }}
            isInvalid={!!errorText}
        />
        <Form.Control.Feedback type="invalid">
            {errorText}
        </Form.Control.Feedback>
    </InputGroup>
}