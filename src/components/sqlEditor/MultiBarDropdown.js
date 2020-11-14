import React from 'react';
import { Dropdown, Button, ButtonGroup, } from 'react-bootstrap';


export function MultiDropdown(props) {
    const { name='defaultNameX', key=0,
        selectedItems, setSelectedItems, options,
        itemToName = x => x,        
    } = props;
    return <Dropdown as={ButtonGroup} key={key}>
        {
            selectedItems.map(itm => <Button variant="success" onClick={() => {
                setSelectedItems(selectedItems.filter(n => itemToName(n) !== itemToName(itm)))
            }}>{itemToName(itm) }</Button>)
        }
        <Dropdown.Toggle split variant="success" id={"dropdown-split-basic-"+name} />

        <Dropdown.Menu>
            {
                options.map(opt => <Dropdown.Item href="#/action-1" onSelect={() => {
                    setSelectedItems(selectedItems.concat(opt));
                }}>{itemToName(opt)}</Dropdown.Item>)
            }            
        </Dropdown.Menu>
    </Dropdown>
}