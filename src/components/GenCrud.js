import React, {useState} from 'react';
import GenCrudAdd from './GenCrudAdd';

const GenCrud = (props) => {
    const {
        columnInfo,
        displayFields,
        fieldFormatter= x=>x,
        rows,
        customSelData,
        customFields={},
    } = props;

    const [dspState,setDspState]=useState('dsp');
    const [editItem, setEditItem] = useState(null);
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
    return (
        <div>
            {
                dspState === 'dsp' &&
                <div>
                    < table >
                        <thead>
                            <tr>
                                {
                                    displayFieldsStripped.map((name,ind) => <th key={ind}>{columnMap[name]?columnMap[name].desc:`****Column ${JSON.stringify(name)} not mapped`}</th>)
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
                                                            dsp=dsp.filter( d => d.value==val )[ 0 ];
                                                            if ( !dsp ) dsp=`**** field ${fn} value ${val} not mapped`;
                                                            else {
                                                                dsp=dsp.label;
                                                            }
                                                        }
                                                    }
                                                    const dspFunc=columnMap[ fn ].dspFunc;
                                                    if ( dspFunc ) {
                                                        dsp=dspFunc( fn, row );
                                                    }
                                                    return <td key={find}>{fieldFormatter( dsp, fn )}</td>
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
                <GenCrudAdd {...props} fieldFormatter={fieldFormatter} onCancel={()=>setDspState('dsp')}></GenCrudAdd>
            }
            {
                dspState==='edit' &&
                <GenCrudAdd {...props} fieldFormatter={fieldFormatter} editItem={editItem} idCol={idCol} onCancel={() => setDspState('dsp')}></GenCrudAdd>
            }
        </div>
    )
}

export default GenCrud;