import React, { useState, useEffect } from "react";
import request from 'superagent';
import { getMinDatesForMaintenance } from '../api';
import moment from 'moment';
import EditDropdown from '../paymentMatch/EditDropdown';
export function YearlyMaintenanceReport(props) {
    const { ownerInfo } = props;
    const [state, setState] = useState({
        curYearSelection: { label: 'NA', value: 'NA' },
        curYearOptions: [],
    });
    useEffect(() => {
        getMinDatesForMaintenance(ownerInfo.ownerID).then(res => {
            console.log(res);
            if (res.rows && res.rows.length) {
                const { minDate } = res.rows[0];
                const fromYYYY = moment(minDate).format('YYYY');
                const currentYYYY = moment().format('YYYY');
                const years = [];
                for (let i = parseInt(fromYYYY); i <= parseInt(currentYYYY); i++) {
                    years.push(i.toString());
                }
                console.log(years.map(y => ({ label: y, value: y })))
                setState({
                    minDate,
                    fromYYYY,
                    curYearOptions: years.map(y=>({label: y, value:y}))
                });
            }
        })
    }, [ownerInfo.owerID]);
    return <div><EditDropdown context={{
        disabled: false,
        curSelection: state.curYearSelection || {},
        setCurSelection: s => {
            setState({
                ...state,
                curYearSelection: s || {},
            })
        },
        getCurSelectionText: o => o.label || '',
        options: state.curYearOptions,
        setOptions: null,
        loadOptions: () => [],
    }}></EditDropdown>
        test
    </div>
}