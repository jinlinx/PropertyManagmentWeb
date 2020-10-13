import React, {useState} from 'react';
import GenCrudAdd from './GenCrudAdd';
import get from 'lodash/get';
import set from 'lodash/set';
import { getPageSorts } from './util';

const GenCrud = (props) => {
    const {
        columnInfo,
        displayFields,
        rows,
        customSelData,
        customFields = {},
        pageState,
        table,
    } = props;

    const [dspState,setDspState]=useState('dsp');
    const [editItem, setEditItem] = useState(null);
    const { pageProps, setPageProps } = pageState;
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
        const fieldFilter = get(pageProps, [table, field, 'filter']) || {};
        const fieldSorts = getPageSorts(pageState, table); //get(pageProps, [table, 'sorts'], []);
        const fieldSortFound = fieldSorts.filter(s => s.name === field)[0];
        const fieldSort = fieldSortFound || {};
        const fName = fieldFilter ? 'F' : 'N';
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
                set(pageProps, [table, 'sorts'], fieldSorts);
                fieldSorts.push(sort);
            }
            setPageProps(Object.assign({}, pageProps, {reloadCount: (pageProps.reloadCount || 0)+1}));
        }
        return <a href='' onClick={onSortClick}>{shortDesc}</a>;
    };
    return (
        <div>
            {
                dspState === 'dsp' &&
                <div>
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