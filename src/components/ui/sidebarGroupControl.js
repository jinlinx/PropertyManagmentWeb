import React, { useState, useEffect } from "react";
import { Collapse } from 'bootstrap'
export function SideBarItem(props) {
    const { name, show, setShow } = props;
    const collapseRef = React.createRef();
    let state = useState(false);
    if (setShow) {        
        state = [show, setShow];
    }
    const isShowing = state[0];

    useEffect(() => {
        const myCollapse = collapseRef.current;
        const bsCollapse = new Collapse(myCollapse, { toggle: false, timeout: 1 })
        isShowing ? bsCollapse.show() : bsCollapse.hide()
    })

    const listClass = `collapse list-unstyled ${isShowing ? 'show' : ''}`;
    return <li className="active">
        <a href="#" data-toggle="collapse" aria-expanded="false" className="dropdown-toggle"
            onClick={() => {
                state[1](!isShowing);
            }}
        >{name}</a>
        <ul className={listClass} ref={collapseRef}>
            {props.children && props.children.map((c, keyi) => <li key={keyi}>{c}</li>)}
        </ul>
    </li>
}