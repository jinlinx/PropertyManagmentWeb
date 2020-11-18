import React from 'react';
import { Spinner } from 'react-bootstrap';

export default function LoadingCover(props) {
    const { isLoading } = props;
    if (isLoading) return <div style={{
        height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, opacity: 0.9,
        'zIndex': 100,
        background: 'grey',
    }}><Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
        /></div>
    
    return null;
}
