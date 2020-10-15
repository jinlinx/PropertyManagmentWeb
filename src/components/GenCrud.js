import React, {useState} from 'react';
import GenCrudAdd from './GenCrudAdd';
import get from 'lodash/get';
import set from 'lodash/set';
import { getPageSorts } from './util';
import Select from 'react-dropdown-select';
import {v1} from 'uuid';
const GenCrud = (props) => {
    const {
        columnInfo,
        displayFields,
        rows,
        customSelData,
        customFields = {},
        pageState,
        table,
        paggingInfo, setPaggingInfo,
    } = props;

    const [dspState,setDspState]=useState('dsp');
    const [editItem, setEditItem] = useState(null);
    const [showFilter, setShowFilter] = useState(false);
    const [filterVals, setFilterVals] = useState([]);
    const { pageProps, setPageProps } = pageState;
    const PageLookRangeMax = 3;    
    const calcPage = ()=>{
        let changed = false;
        const getLastPage = (total, pageSize) => {
            const lst = total / pageSize;
            if (lst * pageSize === total) return lst - 1;
            return lst;
        }
        const lastPage = getLastPage(paggingInfo.total,paggingInfo.PageSize);
        if (lastPage !== paggingInfo.lastPage) {
            paggingInfo.lastPage= lastPage;
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
        for (let i= 1; i <= rearPgs; i++) {
            let ind = paggingInfo.pos +i;
            if (ind <= lastPage) rearPageInds.push(i)
        }
        const needRear3dots = (paggingInfo.pos + rearPgs < lastPage) ;
        return {
            needFront3dots,
            needRear3dots,
            frontPageInds,
            rearPageInds,
        }
    };
    const paggingCalced = calcPage();
    const baseColumnMap = columnInfo.reduce((acc, col) => {
        acc[col.field] = col;
        return acc;
    }, {});
    const columnMap = displayFields.reduce((acc, col) => {
        let val = col;
        let field = col;
        if (typeof col === 'string') {
            val = baseColumnMap[col] || displayFields[col] || {desc:`****Col ${col} not setup`};
        } else {
            field = col.field;
        }
        acc[field] = val;
        return acc;
    }, {});

    const displayFieldsStripped = displayFields.map(f => {
        if (typeof f === 'string') return f;
        if (!f.field) return `*** Field ${f}.field is empty`;
        return f.field;
    });

    const idCol = columnInfo.filter(c => c.isId)[0];

    const addNew = () => {
        setDspState('addNew');
    }

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
        const fieldSorts = getPageSorts(pageState, table); //get(pageProps, [table, 'sorts'], []);
        const fieldSortFound = fieldSorts.filter(s => s.name === field)[0];
        const fieldSort = fieldSortFound || {};
        const getShortDesc = op=>opToDesc[op] || 'NS';
        const shortDesc = getShortDesc(fieldSort.op);
        const onSortClick = e => {
            e.preventDefault();
            const sort =fieldSortFound || {
                name: field,
                shortDesc,
            };
            
            sort.op = opToNext[fieldSort.op || ''];
            sort.shortDesc = getShortDesc(sort.op);
            if (!fieldSortFound) {
                fieldSorts.push(sort);
                set(pageProps, [table, 'sorts'], fieldSorts.filter(s=>s.op));
            }
            setPageProps(Object.assign({}, pageProps, {reloadCount: (pageProps.reloadCount || 0)+1}));
        }
        return <a href='' onClick={onSortClick}>{shortDesc}</a>;
    };
    const filterClick = e => {
        e.preventDefault();
        setShowFilter(!showFilter);
    }
    
    const filterOptions = ['=','!=','<','<=','>','>='].map(value=>({value, label: value}));
    const defaultFilter = filterOptions.filter(x => x.value === '=')[0];
    const makePageButtons = (inds, desc)=>inds.map(ind=><button onClick={e=>{e.preventDefault(); 
        setPaggingInfo({...paggingInfo, pos: ind})
         }}>{desc || ind+1}</button>)
    return (
        <div>
            {
                dspState === 'dsp' &&
                <div>
                    <div>
                        {makePageButtons([0],'<<')}
                        {paggingCalced.needFront3dots?'...':''}
                        {makePageButtons(paggingCalced.frontPageInds)}
                        {paggingInfo.pos}
                         {makePageButtons(paggingCalced.rearPageInds)}
                        {paggingCalced.needRear3dots ? '...' : ''}
                        {makePageButtons([paggingInfo.lastPage],'>>')}
                    </div>
                    <div>
                        <a href="" onClick={filterClick}>{showFilter ? 'Hide' : 'Filter'}</a>
                        {
                            showFilter && <table>
                                {
                                    filterVals.map((fv,ind) => {
                                        return <tr key={ind}>
                                            <td><Select options={displayFields.map(d=>{
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
                            <td><input name={fv.field} onChange={v=>{
                                fv.val = v.target.value;                                
                            }}></input></td>
                            <td><a href="" onClick={e=>{
                                e.preventDefault();
                                setFilterVals(filterVals.filter(f=>f.id !== fv.id));
                            }}>Remove</a></td>
                                        </tr>
                                    })
                                }
                                <tr><td><a href="" onClick={
                                    e=>{
                                        e.preventDefault();
                                        setFilterVals([...filterVals,
                                            {id: v1(), table, op:defaultFilter.value, val:''}
                                        ])
                                    }
                                } >Add</a></td>
                                <td><a href="" onClick={
                                    e=>{
                                        e.preventDefault();                                        
                                        //console.log(filterVals);
                                        set(pageProps, [table, 'filters'], filterVals);
                                        setPageProps(Object.assign({}, pageProps, {reloadCount: (pageProps.reloadCount || 0)+1}));
                                    }
                                } >Submit</a></td>
                                </tr>
                            </table>
                        }
                    </div>
                    < table >
                        <thead>
                            <tr>
                                {
                                    displayFieldsStripped.map((name, ind) => {
                                        return <th key={ind}>
                                            <div>{columnMap[name] ? columnMap[name].desc : `****Column ${JSON.stringify(name)} not mapped`}</div>
                                            <div>{getFieldSort(name)}</div>
                                        </th>
                                    })
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((row,ind) => {
                                    return (
                                        <tr key={ind}>
                                            {
                                                displayFieldsStripped.map( ( fn, find ) => {
                                                    const custFieldType=customFields[ fn ];
                                                    let val=row[ fn ]
                                                    let dsp=val;
                                                    if ( custFieldType==='custom_select' ) {
                                                        dsp=customSelData[ fn ];
                                                        if ( !dsp||!dsp.filter ) dsp=`***** unmapped field ${fn}`;
                                                        else {
                                                            dsp=dsp.filter( d => d.value===val )[ 0 ];
                                                            if ( !dsp ) dsp=`**** field ${fn} value ${val} not mapped`;
                                                            else {
                                                                dsp=dsp.label;
                                                            }
                                                        }
                                                    }
                                                    const dspFunc=columnMap[ fn ].dspFunc;
                                                    if ( dspFunc ) {
                                                        dsp=dspFunc(val, row);
                                                    }
                                                    return <td key={find}>{dsp}</td>
                                                } )
                                            }
                                            <td>
                                                {idCol && <button onClick={() => props.doDelete(idCol.field, row[idCol.field])}>Delete</button>}
                                                {idCol&&<button onClick={() => {
                                                    setEditItem(row);
                                                    setDspState('edit');
                                                }}>Edit</button>
                                                }
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                    <tr key='a'>
                                        <td colSpan={displayFieldsStripped.length + 1}>No Data found</td>
                                    </tr>
                                )
                            }
                        
                        </tbody>
                    </table>
                    <button onClick={addNew}>Add</button>
                </div>
            }

            {
                dspState === 'addNew' &&
                <GenCrudAdd {...props} onCancel={() => setDspState('dsp')}></GenCrudAdd>
            }
            {
                dspState==='edit' &&
                <GenCrudAdd {...props} editItem={editItem} idCol={idCol} onCancel={() => setDspState('dsp')}></GenCrudAdd>
            }
        </div>
    )
}

export default GenCrud;