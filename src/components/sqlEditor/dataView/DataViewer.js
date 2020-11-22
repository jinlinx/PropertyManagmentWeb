import React, { useState, useEffect } from 'react';
import set from 'lodash/set';
import { v1 } from 'uuid';
import { Table, Form, DropdownButton, Dropdown, Button } from 'react-bootstrap';
import Select from 'react-dropdown-select';
import { sqlGetTables, sqlFreeForm, sqlGetTableInfo } from '../../api';
import { getPageSorts } from '../../util';

import { DataGrid } from './dataGrid';
export function DataViewerAuto(props) {
    const [columnTableInfo, setTableColumnInfo] = useState({});
    const [paggingInfo, setPaggingInfo] = useState({
        PageSize: 10,
        pos: 0,
        total: 0,
    });
    const [rows, setRows] = useState(null);
    return <DataViewer  params={
        {            
            ...props,
            columnTableInfo, setTableColumnInfo,
            paggingInfo, setPaggingInfo,
            rows, setRows
        }
    }></DataViewer>
}
export function DataViewer (props) {
    const {
        columnTableInfo, setTableColumnInfo,
        pageProps, setPageProps,        
        paggingInfo, setPaggingInfo,
        rows, setRows,
        table,
    } = props.params;

    const [loadState, setLoadState] = useState('init');    
    const [showFilter, setShowFilter] = useState(false);
    const [filterVals, setFilterVals] = useState([]);
    function loadColumnInfo() {
        return sqlGetTableInfo(table).then(res => {
            setTableColumnInfo({
                ...columnInfo,
                [table]: res,
            });
        })
    }

    const columnInfo = columnTableInfo[table];

    useEffect(() => {
        if (!columnInfo) {
            loadColumnInfo().then(()=>setLoadState('columnLoaded'));
        } else  {
            const fields = columnInfo.fields.map(t => t.fieldName).join(',');
            sqlFreeForm(`select count(1) cnt from ${table}`).then(cntres => {                
                return sqlFreeForm(`select ${fields} from ${table} limit ${paggingInfo.pos}, ${paggingInfo.PageSize}`).then(res => {
                    setRows(res);
                    setPaggingInfo({ ...paggingInfo, total: cntres[0].cnt })
                    setLoadState('init');
                })
            })            
        }
    }, [table, loadState, paggingInfo.pos]);
    if (!rows || !columnInfo || !columnInfo.fields)
        return <span>test</span>
    const PageLookRangeMax = 3;
    const calcPage = () => {
        let changed = false;
        const getLastPage = (total, pageSize) => {
            const lst = parseInt(total / pageSize);
            if (lst * pageSize === total) return lst - 1;
            return lst;
        }
        const lastPage = getLastPage(paggingInfo.total, paggingInfo.PageSize);
        if (lastPage !== paggingInfo.lastPage) {
            paggingInfo.lastPage = lastPage;
            changed = true;
        }
        let frontPgs = PageLookRangeMax, rearPgs = PageLookRangeMax;
        let front = paggingInfo.pos - frontPgs;
        if (front < 0) rearPgs -= front;
        let back = paggingInfo.lastPage - paggingInfo.pos - rearPgs;
        if (back < 0) frontPgs -= back;

        const needFront3dots = paggingInfo.pos > frontPgs;
        const frontPageInds = [];
        for (let i = frontPgs; i > 0; i--) {
            let ind = paggingInfo.pos - i;
            if (ind >= 0) frontPageInds.push(ind);
        }
        const rearPageInds = [];
        for (let i = 1; i <= rearPgs; i++) {
            let ind = paggingInfo.pos + i;
            if (ind <= lastPage) rearPageInds.push(ind)
        }
        const needRear3dots = (paggingInfo.pos + rearPgs < lastPage);
        return {
            needFront3dots,
            needRear3dots,
            frontPageInds,
            rearPageInds,
        }
    };
    const paggingCalced = calcPage();
    
    
    const getFieldSort = field => {
        const opToDesc = {
            'asc': 'AS',
            'desc': 'DS',
        };
        const opToNext = {
            'asc': 'desc',
            'desc': '',
            '': 'asc',
        }
        //const fieldFilter = get(pageProps, [table, field, 'filter']) || {};
        const fieldSorts = getPageSorts({ pageProps, setPageProps }, table); //get(pageProps, [table, 'sorts'], []);
        const fieldSortFound = fieldSorts.filter(s => s.name === field)[0];
        const fieldSort = fieldSortFound || {};
        const getShortDesc = op => opToDesc[op] || 'NS';
        const shortDesc = getShortDesc(fieldSort.op);
        const onSortClick = e => {
            e.preventDefault();
            const sort = fieldSortFound || {
                name: field,
                shortDesc,
            };

            sort.op = opToNext[fieldSort.op || ''];
            sort.shortDesc = getShortDesc(sort.op);
            if (!fieldSortFound) {
                fieldSorts.push(sort);
                set(pageProps, [table, 'sorts'], fieldSorts.filter(s => s.op));
            }
            setPageProps(Object.assign({}, pageProps, { reloadCount: (pageProps.reloadCount || 0) + 1 }));
        }
        return <a href='' onClick={onSortClick}>{shortDesc}</a>;
    };
    const filterClick = e => {
        e.preventDefault();
        setShowFilter(!showFilter);
    }

    const filterOptions = ['=', '!=', '<', '<=', '>', '>='].map(value => ({ value, label: value }));
    const defaultFilter = filterOptions.filter(x => x.value === '=')[0];
    const makePageButtons = (inds, desc) => inds.map((ind,keyId) => <Button key={keyId} onClick={e => {
        e.preventDefault();
        setPaggingInfo({ ...paggingInfo, pos: ind })
    }}>{desc || ind + 1}</Button>)
    return (
        <div>
            {                
                <div>
                    {
                        paggingInfo.lastPage >0 && <div>
                            {makePageButtons([0], '<<')}
                            {paggingCalced.needFront3dots ? '...' : ''}
                            {makePageButtons(paggingCalced.frontPageInds)}
                            {paggingInfo.pos + 1}
                            {makePageButtons(paggingCalced.rearPageInds)}
                            {paggingCalced.needRear3dots ? '...' : ''}
                            {makePageButtons([paggingInfo.lastPage], '>>')}
                        </div>
                    }
                    <div>
                        <a href="" onClick={filterClick}>{showFilter ? 'Hide' : 'Filter'}</a>
                        {
                            showFilter && <table>
                                {
                                    filterVals.map((fv, ind) => {
                                        return <tr key={ind}>
                                            <td><Select options={columnInfo.fields.map(d => {
                                                return {
                                                    value: d.field,
                                                    label: d.desc,
                                                }
                                            })}
                                                values={[fv]}
                                                onChange={val => {
                                                    fv.field = val[0].value;
                                                    setFilterVals(filterVals);
                                                }
                                                }></Select></td>
                                            <td><Select options={filterOptions}
                                                values={[defaultFilter]}
                                                onChange={val => {
                                                    fv.op = val[0].value;
                                                    setFilterVals(filterVals);
                                                }
                                                }></Select></td>
                                            <td><input name={fv.field} onChange={v => {
                                                fv.val = v.target.value;
                                            }}></input></td>
                                            <td><a href="" onClick={e => {
                                                e.preventDefault();
                                                setFilterVals(filterVals.filter(f => f.id !== fv.id));
                                            }}>Remove</a></td>
                                        </tr>
                                    })
                                }
                                <tr><td><a href="" onClick={
                                    e => {
                                        e.preventDefault();
                                        setFilterVals([...filterVals,
                                        { id: v1(), table, op: defaultFilter.value, val: '' }
                                        ])
                                    }
                                } >Add</a></td>
                                    <td><a href="" onClick={
                                        e => {
                                            e.preventDefault();
                                            //console.log(filterVals);
                                            set(pageProps, [table, 'filters'], filterVals);
                                            setPageProps(Object.assign({}, pageProps, { reloadCount: (pageProps.reloadCount || 0) + 1 }));
                                        }
                                    } >Submit</a></td>
                                </tr>
                            </table>
                        }
                    </div>
                    <DataGrid context={ 
                        {
                            table,
                            columnInfo,
                            rows,                            
                            getFieldSort,
                            doDelete: props.doDelete,
                        }
                    }/>                    
                    <Button onClick={()=>{}}>Add</Button>
                </div>
            }            
        </div>
    )
}
