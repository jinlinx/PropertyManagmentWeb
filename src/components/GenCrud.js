import React, {useState} from 'react';
import GenCrudAdd from './GenCrudAdd';

const GenCrud = (props) => {
    const {
        columnInfo,
        displayFields,
        rows,
    } = props;

    const [dspState,setDspState]=useState('dsp');
    const [editItem,setEditItem]=useState(null);
    const columnMap = (displayFields||columnInfo).reduce((acc, col) => {
        acc[col.field] = col;
        return acc;
    }, {});

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
                                    displayFields.map((name,ind) => <th key={ind}>{columnMap[name.field]?columnMap[name.field].desc:`****Column ${JSON.stringify(name)} not mapped`}</th>)
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((row,ind) => {
                                    return (
                                        <tr key={ind}>
                                            {
                                                displayFields.map((fn,find) => <td key={find}>{row[fn.field]}</td>)
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
                                    <tr>
                                        <td colSpan={displayFields.length + 1}>No Data found</td>
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
                <GenCrudAdd {...props} onCancel={()=>setDspState('dsp')}></GenCrudAdd>
            }
            {
                dspState==='edit' &&
                <GenCrudAdd {...props} editItem={editItem} idCol={idCol} onCancel={() => setDspState('dsp')}></GenCrudAdd>
            }
        </div>
    )
}

export default GenCrud;